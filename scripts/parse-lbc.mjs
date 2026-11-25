import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const rawDir = join(root, "data", "raw");
const outFile = join(root, "lib", "catalog.extra.json");

function parsePrice(raw) {
  if (!raw) return 0;
  const n = parseFloat(raw.replace(/[^\d.,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function splitLocation(text) {
  const m = (text || "").match(/(\d{5})/);
  const zip = m ? m[1] : "";
  const location = (text || "").trim();
  const city = zip
    ? location.replace(new RegExp(`\\s*${zip}\\s*$`), "").trim()
    : location;
  return { location, city, zip };
}

function detectBadges(seg) {
  const badges = [];
  if (/à la une/i.test(seg)) badges.push("a-la-une");
  if (/urgent/i.test(seg)) badges.push("urgent");
  if (/\bpro\b|vendeur professionnel/i.test(seg)) badges.push("pro");
  if (/baisse de prix/i.test(seg)) badges.push("baisse-prix");
  if (/sponsoris/i.test(seg)) badges.push("sponsorise");
  return badges;
}

function detectCondition(title, seg, price) {
  if (/échang/i.test(seg)) return "Échange";
  // prix symbolique (1 €) = échange / annonce non réelle de vente
  if (price <= 1) return "Échange";
  if (/sous blister|neuf/i.test(title)) return "Neuf";
  if (/réconditionn/i.test(seg)) return "Reconditionné";
  return "Occasion";
}

function detectShipping(seg) {
  const m = seg.match(/Livraison dès\s*(\d[\d.,]*)\s*€/i);
  if (m) return `${m[1]} €`;
  return "Retrait sur place";
}

export function parseLbcMarkdown(md) {
  const offers = [];
  // Each listing starts with "- [Voir l'annonce](URL)".
  const blocks = md.split(/- \[Voir l'annonce\]/);
  for (const block of blocks.slice(1)) {
    const urlMatch = block.match(
      /\((https?:\/\/www\.leboncoin\.fr\/ad\/[^)]+)\)/,
    );
    const url = urlMatch ? urlMatch[1] : "";
    const idMatch = url.match(/\/ad\/[^/]+\/(\d+)/);
    const adId = idMatch ? Number(idMatch[1]) : 0;
    if (!adId) continue;

    const imgMatch = block.match(
      /!\[[^\]]*\]\((https:\/\/img\.leboncoin\.fr\/[^)]+)\)/,
    );
    const image = imgMatch ? imgMatch[1] : "";
    if (!image) continue;

    // Main price: first standalone "1 234 €" line (tolerates "600 €.",
    // "600 €.. Baisse de prix" or "70 €Baisse de prix").
    const priceMatch = block.match(
      /^[ \t]*([0-9][0-9.,\s]*)€[ .,]*(?:Baisse de prix)?[ \t]*$/m,
    );
    const priceLabel = priceMatch ? priceMatch[0].trim() : "";
    const price = parsePrice(priceMatch ? priceMatch[1] : "");

    // Location + category from the standard footer lines.
    const locMatch = block.match(/Située à\s*(.+?)\./);
    const { location, city, zip } = splitLocation(
      locMatch ? locMatch[1] : "",
    );
    const catMatch = block.match(/Catégorie\s*:\s*(.+?)\./);
    const category = catMatch ? catMatch[1].trim() : "Toute catégorie";

    // Title: text between the image and the price line, cleaned up.
    // Remove image/link markdown first (so no stray ")" or "](url)" leaks in),
    // then drop every meta line (badges, price, location, category, delivery…).
    const priceIndex = priceMatch ? priceMatch.index : block.length;
    const beforePrice = block.slice(0, priceIndex);
    const cleaned = beforePrice
      .replace(/^\([^)]*\)\s*/, "") // leading "(URL)" from the link
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "\n") // images
      .replace(/\[[^\]]*\]\([^)]*\)/g, "\n") // links [text](url)
      .replace(/\]\([^)]*\)/g, "\n"); // stray "] (url)"
    const isMeta = (s) =>
      /^(À la une|Annonce à la une\.?|Urgent|Annonce urgente\.?|Pro|Vendeur professionnel\.?|Sponsorisé|Paiement sécurisé|Baisse de prix|Inclus|·Inclus|Prix:|Catégorie|Située|Livraison|dès|aujourd'hui|Date de dépôt|Résultats|Tri :|Annonce)/i.test(
        s,
      ) ||
      /^[0-9][0-9.,\s]*€/.test(s) || // bare price line
      /^[A-ZÀ-ÿ][\w'â€ -]* [0-9]{5}$/.test(s) || // bare "City 12345"
      /^\d{5}$/.test(s); // bare zip
    const titleLines = cleaned
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !isMeta(s));
    const title = titleLines
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (title.length < 3) continue;

    offers.push({
      id: String(adId),
      adId,
      title,
      price,
      priceLabel: price ? `${price} €` : priceLabel || "Prix sur demande",
      location: location || "France",
      city: city || "France",
      zip,
      category: category || "Toute catégorie",
      image,
      url,
      badges: detectBadges(block),
      sponsored: /sponsoris/i.test(block),
      condition: detectCondition(title, block, price),
      shipping: detectShipping(block),
    });
  }
  return offers;
}

// --- run ---
const rawFiles = readdirSync(rawDir).filter((f) => f.endsWith(".md")).sort();
const all = [];
for (const f of rawFiles) {
  const md = readFileSync(join(rawDir, f), "utf8");
  const parsed = parseLbcMarkdown(md);
  console.log(`${f}: ${parsed.length} offres`);
  all.push(...parsed);
}

// dedupe by adId (keep first occurrence)
const seen = new Set();
const deduped = [];
for (const o of all) {
  if (seen.has(o.adId)) continue;
  seen.add(o.adId);
  deduped.push(o);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(deduped, null, 2));
console.log(`\nTotal: ${deduped.length} offres uniques -> ${outFile}`);
