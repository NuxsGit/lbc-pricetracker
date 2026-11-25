import { BadgeDollarSign, Crown, Gauge, Sparkles, Star } from "lucide-react";
import type { BadgeKind } from "@/lib/types";

const MAP: Record<
  BadgeKind,
  { label: string; cls: string; icon: typeof Crown }
> = {
  "a-la-une": {
    label: "À la une",
    cls: "bg-amber-400/85 text-amber-950",
    icon: Crown,
  },
  urgent: {
    label: "Urgent",
    cls: "bg-rose-500/85 text-white",
    icon: Gauge,
  },
  pro: {
    label: "Pro",
    cls: "bg-apple-500/90 text-white",
    icon: Sparkles,
  },
  "baisse-prix": {
    label: "Baisse de prix",
    cls: "bg-emerald-500/85 text-white",
    icon: BadgeDollarSign,
  },
  sponsorise: {
    label: "Sponsorisé",
    cls: "bg-slate-500/80 text-white",
    icon: Star,
  },
};

export function Badges({
  badges,
  className = "",
}: {
  badges: BadgeKind[];
  className?: string;
}) {
  if (!badges.length) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((b) => {
        const { label, cls, icon: Icon } = MAP[b];
        return (
          <span
            key={b}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none shadow-sm ${cls}`}
          >
            <Icon className="h-3 w-3" strokeWidth={2.5} />
            {label}
          </span>
        );
      })}
    </div>
  );
}
