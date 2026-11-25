"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, RotateCw } from "lucide-react";
import type { SortKey } from "@/lib/types";

interface FilterBarProps {
  sort: SortKey;
  onSort: (s: SortKey) => void;
  minPrice: string;
  maxPrice: string;
  onMinPrice: (v: string) => void;
  onMaxPrice: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  categories: string[];
  count: number;
  loading: boolean;
  onRefresh: () => void;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "best", label: "Meilleures offres" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "relevance", label: "Pertinence" },
];

const INPUT_CLS =
  "w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 backdrop-blur-sm transition-colors focus:border-apple-400 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-apple-400/30";

export function FilterBar({
  sort,
  onSort,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  category,
  onCategory,
  categories,
  count,
  loading,
  onRefresh,
}: FilterBarProps) {
  return (
    <div className="glass flex flex-col gap-3 rounded-3xl p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-500">
          <SlidersHorizontal className="h-3.5 w-3.5 text-apple-500" />
          <span className="hidden sm:inline">Filtres</span>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-400">Trier</span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as SortKey)}
            className={INPUT_CLS}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-1.5">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-400">Prix min</span>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => onMinPrice(e.target.value)}
              placeholder="0"
              className={`${INPUT_CLS} w-20`}
            />
          </label>
          <span className="pb-2 text-slate-400">–</span>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-400">Prix max</span>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => onMaxPrice(e.target.value)}
              placeholder="max"
              className={`${INPUT_CLS} w-20`}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-400">Catégorie</span>
          <select
            value={category}
            onChange={(e) => onCategory(e.target.value)}
            className={INPUT_CLS + " min-w-[150px]"}
          >
            <option value="">Toutes</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <div className="text-right">
          <div className="text-xs font-medium text-slate-400">Offres affichées</div>
          <div className="text-lg font-bold text-apple-700">{count}</div>
        </div>
        <motion.button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          whileTap={{ scale: 0.94 }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-apple-400/40 bg-apple-500/10 px-3.5 py-2 text-sm font-semibold text-apple-700 transition-colors hover:bg-apple-500/20 disabled:opacity-60"
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Relancer
        </motion.button>
      </div>
    </div>
  );
}
