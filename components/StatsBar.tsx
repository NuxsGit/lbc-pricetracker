"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { Tag, TrendingDown, Package, Timer } from "lucide-react";

interface StatsBarProps {
  count: number;
  min: number;
  avg: number;
  best: number;
  source: "live" | "cache";
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(display, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value]);

  return (
    <span ref={ref}>{Math.round(display).toLocaleString("fr-FR")}</span>
  );
}

const STYLES =
  "rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col gap-1 min-w-0";

export function StatsBar({ count, min, avg, best, source }: StatsBarProps) {
  const live = source === "live";
  return (
    <div className="glass-strong grid grid-cols-2 gap-3 overflow-hidden rounded-3xl lg:grid-cols-4">
      <div className={`${STYLES} bg-white/40`}>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Package className="h-3.5 w-3.5 text-apple-500" />
          Offres trouvées
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-800">
          <CountUp value={count} />
        </div>
      </div>

      <div className={`${STYLES} bg-white/40`}>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Tag className="h-3.5 w-3.5 text-apple-500" />
          Prix minimum
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-800">
          {min > 0 ? (
            <CountUp value={min} />
          ) : (
            <span className="text-base">—</span>
          )}{" "}
          <span className="text-lg text-slate-400">€</span>
        </div>
      </div>

      <div className={`${STYLES} bg-white/40`}>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Timer className="h-3.5 w-3.5 text-apple-500" />
          Prix moyen
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-800">
          {avg > 0 ? (
            <CountUp value={avg} />
          ) : (
            <span className="text-base">—</span>
          )}{" "}
          <span className="text-lg text-slate-400">€</span>
        </div>
      </div>

      <div className={`${STYLES} bg-gradient-to-br from-apple-500/15 to-white/40 ring-1 ring-apple-400/30`}>
        <div className="flex items-center gap-1.5 text-xs font-medium text-apple-700">
          <TrendingDown className="h-3.5 w-3.5" />
          Meilleure offre
        </div>
        <div className="text-2xl font-bold tracking-tight text-apple-700">
          {best > 0 ? (
            <CountUp value={best} />
          ) : (
            <span className="text-base">—</span>
          )}{" "}
          <span className="text-lg text-apple-500">€</span>
        </div>
      </div>

      <div
        className={`${STYLES} bg-white/40 lg:col-span-4`}
        style={{ gridColumn: "1 / -1" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Source des données
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              live
                ? "bg-emerald-500/15 text-emerald-700"
                : "bg-amber-500/15 text-amber-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                live ? "bg-emerald-500" : "bg-amber-500"
              } ${live ? "animate-pulse-soft" : ""}`}
            />
            {live ? "Données live" : "Instantané Leboncoin"}
          </span>
        </div>
      </div>
    </div>
  );
}
