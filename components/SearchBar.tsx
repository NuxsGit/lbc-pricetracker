"use client";

import { motion } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  presets: string[];
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  loading,
  presets,
}: SearchBarProps) {
  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="glass-strong flex flex-col gap-3 rounded-3xl p-2.5 shadow-glass sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2 px-3">
          <Search className="h-5 w-5 shrink-0 text-apple-500" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Rechercher un objet sur Leboncoin… (ex. RTX 5060)"
            className="w-full bg-transparent py-2.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                onSubmit();
              }}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600"
              aria-label="Effacer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.96 }}
          className="blue-gradient inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-7 py-3 text-base font-semibold text-white sheen shadow-lg shadow-apple-500/30 transition-opacity disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" strokeWidth={2.5} />
          )}
          <span className="hidden sm:inline">Rechercher</span>
        </motion.button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400">Suggestions :</span>
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              onChange(p);
              onSubmit();
            }}
            className="rounded-full border border-white/70 bg-white/50 px-3 py-1 text-xs font-medium text-apple-700 backdrop-blur-sm transition-all hover:scale-105 hover:border-apple-400 hover:bg-white/80"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
