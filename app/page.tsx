"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Tag, Sparkles, ShieldCheck } from "lucide-react";
import type { Offer, SortKey } from "@/lib/types";
import { CACHE_OFFERS, PRESETS, searchCacheOffers } from "@/lib/data";
import { GlassBackground } from "@/components/GlassBackground";
import { SearchBar } from "@/components/SearchBar";
import { StatsBar } from "@/components/StatsBar";
import { FilterBar } from "@/components/FilterBar";
import { OfferCard } from "@/components/OfferCard";
import { Loader } from "@/components/Loader";
import { EmptyState } from "@/components/EmptyState";

const DEFAULT_QUERY = "RTX 5060";

export default function Home() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [offers, setOffers] = useState<Offer[]>(() =>
    CACHE_OFFERS.filter(
      (o) =>
        o.title.toLowerCase().includes("rtx") &&
        o.title.toLowerCase().includes("5060"),
    ),
  );
  const [source, setSource] = useState<"live" | "cache">("cache");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [note, setNote] = useState<string | undefined>(undefined);

  const [sort, setSort] = useState<SortKey>("best");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState("");

  const runSearch = useCallback(async (q: string, showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(false);
    try {
      // Client-side search against the bundled real Leboncoin snapshot.
      // Works on the static GitHub Pages build (no server / API needed).
      const results = searchCacheOffers(q);
      setOffers(results);
      setSource("cache");
      setQuery(q);
      setNote(
        q.trim()
          ? `Instantané Leboncoin pour « ${q.trim()} » — recherche hors ligne.`
          : "Instantané Leboncoin.",
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  // Initial load: show cached snapshot immediately, then refresh via the API.
  useEffect(() => {
    runSearch(DEFAULT_QUERY, false);
  }, [runSearch]);

  // --- filtering (client-side, instant) ---
  const categories = useMemo(
    () => Array.from(new Set(offers.map((o) => o.category))).sort(),
    [offers],
  );

  const filtered = useMemo(() => {
    const min = parseInt(minPrice, 10);
    const max = parseInt(maxPrice, 10);
    return offers.filter((o) => {
      if (category && o.category !== category) return false;
      if (Number.isFinite(min) && o.price < min) return false;
      if (Number.isFinite(max) && o.price > max) return false;
      return true;
    });
  }, [offers, minPrice, maxPrice, category]);

  // --- sorting ---
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "best") {
      arr.sort((a, b) => {
        const ae = a.condition === "Échange";
        const be = b.condition === "Échange";
        if (ae !== be) return ae ? 1 : -1;
        return a.price - b.price;
      });
    } else if (sort === "price-asc") {
      arr.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      arr.sort((a, b) => b.price - a.price);
    }
    return arr;
  }, [filtered, sort]);

  // --- stats (sale offers only, for meaningful price figures) ---
  const saleOffers = useMemo(
    () => filtered.filter((o) => o.condition !== "Échange" && o.price > 0),
    [filtered],
  );
  const stats = useMemo(() => {
    const prices = saleOffers.map((o) => o.price);
    const min = prices.length ? Math.min(...prices) : 0;
    const avg = prices.length
      ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
      : 0;
    const best = min;
    return { count: filtered.length, min, avg, best };
  }, [filtered, saleOffers]);

  const bestOfferId = useMemo(() => {
    if (!saleOffers.length) return null;
    const best = Math.min(...saleOffers.map((o) => o.price));
    return saleOffers.find((o) => o.price === best)?.id ?? null;
  }, [saleOffers]);

  const resultsKey = `${query}|${source}|${offers.length}`;

  return (
    <>
      <GlassBackground />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl blue-gradient shadow-lg shadow-apple-500/40">
              <Tag className="h-6 w-6 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800">
                Leboncoin <span className="text-gradient">Price Tracker</span>
              </h1>
              <p className="text-xs text-slate-500">
                Les meilleures offres, en temps réel
              </p>
            </div>
          </div>
          <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-apple-500" />
            Non-officiel · données Leboncoin
          </span>
        </motion.header>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-8 max-w-3xl"
        >
          <div className="mb-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-apple-500/10 px-3 py-1 text-xs font-semibold text-apple-700">
              <Sparkles className="h-3.5 w-3.5" />
              Style Apple · Frost Glass
            </span>
          </div>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Comparez les prix et découvrez les{" "}
            <span className="text-gradient">meilleures offres</span> sur
            Leboncoin
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Cherchez un objet — par exemple une RTX 5060 — et parcourez toutes
            les annonces contenant ce mot, avec images, prix et localisation.
          </p>
        </motion.section>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
          className="mb-8"
        >
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={() => runSearch(query, true)}
            loading={loading}
            presets={PRESETS}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="mb-6"
        >
          <StatsBar
            count={stats.count}
            min={stats.min}
            avg={stats.avg}
            best={stats.best}
            source={source}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="mb-6"
        >
          <FilterBar
            sort={sort}
            onSort={setSort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPrice={setMinPrice}
            onMaxPrice={setMaxPrice}
            category={category}
            onCategory={setCategory}
            categories={categories}
            count={sorted.length}
            loading={loading}
            onRefresh={() => runSearch(query, true)}
          />
        </motion.div>

        {error && (
          <div className="glass mb-6 rounded-2xl px-4 py-3 text-sm text-rose-600">
            Une erreur est survenue lors de la recherche.
          </div>
        )}

        {note && source === "cache" && !error && (
          <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-xs font-medium text-amber-700 backdrop-blur-sm">
            {note}
          </div>
        )}

        {/* Results */}
        <section className="flex-1">
          {loading && offers.length === 0 ? (
            <Loader />
          ) : sorted.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <motion.div
              key={resultsKey}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {sorted.map((offer, i) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  index={i}
                  isBest={offer.id === bestOfferId}
                />
              ))}
            </motion.div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/60 pt-6 text-center">
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-slate-400">
            Leboncoin Price Tracker est un outil non-officiel à but
            démonstratif. Les annonces, prix et images sont collectés depuis
            leboncoin.fr. L&apos;API Leboncoin n&apos;est pas publique : en
            réseau restreint, les résultats proviennent d&apos;un instantané en
            cache de vraies annonces.
          </p>
        </footer>
      </main>
    </>
  );
}
