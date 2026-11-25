"use client";

import { motion } from "framer-motion";
import { MapPin, ExternalLink, Truck, Package } from "lucide-react";
import type { Offer } from "@/lib/types";
import { OfferImage } from "./OfferImage";
import { Badges } from "./Badges";

function formatPrice(n: number): string {
  return `${n.toLocaleString("fr-FR")} €`;
}

interface OfferCardProps {
  offer: Offer;
  index: number;
  isBest: boolean;
}

export function OfferCard({ offer, index, isBest }: OfferCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.045, 0.6),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      className={`glass-card group relative flex flex-col overflow-hidden rounded-3xl ${
        isBest ? "ring-1 ring-apple-400/70 shadow-glow" : ""
      }`}
    >
      {isBest && (
        <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-apple-500 to-apple-700 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Meilleure offre
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
          <OfferImage src={offer.image} alt={offer.title} price={offer.price} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <Badges badges={offer.badges} />
        </div>

        <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug text-slate-800">
          {offer.title}
        </h3>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-apple-700">
              {offer.price > 0 ? formatPrice(offer.price) : "Échange"}
            </span>
            {offer.price > 0 && offer.condition !== "Échange" && (
              <span className="text-xs text-slate-400">prix</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-apple-500" />
              {offer.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Package className="h-3.5 w-3.5 text-apple-500" />
              {offer.category}
            </span>
            {offer.shipping && offer.shipping !== "Retrait sur place" && (
              <span className="inline-flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-apple-500" />
                Livraison
              </span>
            )}
          </div>

          <a
            href={offer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl blue-gradient px-4 py-2.5 text-sm font-semibold text-white sheen transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          >
            Voir l'annonce
            <ExternalLink className="h-4 w-4" strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
