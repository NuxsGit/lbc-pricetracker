import * as cheerio from "cheerio";
import { CACHE_OFFERS, CACHE_COLLECTED_AT, buildImageUrl } from "./data";
import type { Offer } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15";

const SEARCH_URL = "https://www.leboncoin.fr/recherche";

/**
 * Extract the euro amount from a Leboncoin price string like "900 €",
 * "1 350 €" or "dès 6,49 €".
 */
function parsePrice(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d,]/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function splitLocation(text: string): { location: string; city: string; zip: string } {
  const m = text.match(/(\d{5})/);
  const zip = m ? m[1] : "";
  const location = text.trim();
  // city = text before the trailing zip
  const city = zip ? location.replace(new RegExp(`\\s*${zip}\\s*$`), "").trim() : location;
  return { location, city, zip };
}

interface ParsedAd {
  adId: number;
  title: string;
  price: number;
  priceLabel: string;
  location: string;
  city: string;
  zip: string;
  category: string;
  image: string;
  url: string;
}

/**
 * Parse a Leboncoin SSR search page into structured offers.
 *
 * Leboncoin renders search results server-side, so a plain GET of the search
 * URL returns HTML containing the listings. We walk every ad link and pull the
 * image, title, price and location from the surrounding card.
 */
function parseSearchHtml(html: string, query: string): { offers: Offer[]; total: number } {
  const $ = cheerio.load(html);
  const offers: Offer[] = [];
  const seen = new Set<number>();

  $('a[href*="/ad/"]').each((_, el) => {
    const $a = $(el);
    const href = $a.attr("href") || "";
    const idMatch = href.match(/\/ad\/[^/]+\/(\d+)/);
    if (!idMatch) return;
    const adId = Number(idMatch[1]);
    if (seen.has(adId)) return;

    // Walk up to a reasonable card container.
    let $card = $a;
    for (let i = 0; i < 6 && $card.length && $card.parent().length; i++) {
      $card = $card.parent();
      if ($card.find("img[src*='img.leboncoin.fr']").length > 0) break;
    }
    const $scope = $card.length ? $card : $a.parent();

    const $img = $scope.find("img[src*='img.leboncoin.fr']").first();
    const image = $img.attr("src") || $img.attr("data-src") || "";
    if (!image) return;

    // Title: the longest text node near the card that is not the price/location.
    const title =
      $scope.find("[data-testid*='title'], h2, h3, .card-title").first().text().trim() ||
      $scope.find("a").not($a).first().text().trim();

    const priceLabel =
      $scope.find("[data-testid*='price'], .price, [class*='price']").first().text().trim();

    const locText =
      $scope.find("[data-testid*='location'], [class*='location'], [class*='place']").first().text().trim();

    const catText =
      $scope.find("[data-testid*='category'], [class*='category'], [class*='cat']").first().text().trim();

    if (!title) return;

    const { location, city, zip } = splitLocation(locText || "");
    const price = parsePrice(priceLabel);

    seen.add(adId);
    offers.push({
      id: String(adId),
      adId,
      title,
      price,
      priceLabel: price ? `${price} €` : priceLabel || "Prix sur demande",
      location: location || "France",
      city: city || "France",
      zip,
      category: catText || "Toute catégorie",
      image,
      url: "https://www.leboncoin.fr" + href,
      badges: [],
      sponsored: false,
      condition: "Occasion",
      shipping: "Retrait sur place",
      collectedAt: Date.now(),
    });
  });

  return { offers, total: offers.length };
}

/**
 * Try to fetch live offers from Leboncoin. Returns the parsed offers on success.
 * Any failure (network blocked, DataDome, parse error) throws and the caller
 * falls back to the cached snapshot.
 */
export async function fetchLiveOffers(query: string, limit = 60): Promise<Offer[]> {
  const url = `${SEARCH_URL}?text=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Upgrade-Insecure-Requests": "1",
    },
    // never let this hang the request
    signal: AbortSignal.timeout(9000),
  });

  if (!res.ok) throw new Error(`Leboncoin responded ${res.status}`);
  const html = await res.text();
  const { offers } = parseSearchHtml(html, query);
  if (offers.length === 0) throw new Error("No offers parsed from live page");
  return offers.slice(0, limit);
}

export interface SearchOutcome {
  offers: Offer[];
  source: "live" | "cache";
  note?: string;
}

/**
 * High-level search: prefer live data, gracefully fall back to the cached
 * snapshot of real Leboncoin results. The cache is filtered by the query so the
 * app always returns something meaningful, even fully offline.
 */
export async function search(query: string, limit = 60): Promise<SearchOutcome> {
  const q = (query || "").trim();
  if (q) {
    try {
      const live = await fetchLiveOffers(q, limit);
      if (live.length > 0) return { offers: live, source: "live" };
    } catch {
      // fall through to cache
    }
  }

  // Cache fallback: filter cached offers by the query keywords.
  const keywords = q.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = CACHE_OFFERS.filter((o) => {
    if (!keywords.length) return true;
    return keywords.every((k) => o.title.toLowerCase().includes(k));
  });

  return {
    offers: filtered.slice(0, limit),
    source: "cache",
    note: q
      ? `Aucune connexion directe à Leboncoin disponible — affichage de l'instantané en cache pour « ${q} ».`
      : "Instantané en cache de Leboncoin.",
  };
}

export { CACHE_OFFERS, CACHE_COLLECTED_AT, buildImageUrl };
