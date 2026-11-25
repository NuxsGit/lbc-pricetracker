import { Loader2, Radar } from "lucide-react";

export function Loader({ label = "Recherche des offres…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-apple-400/30" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full glass-strong">
          <Radar className="h-7 w-7 animate-spin text-apple-600" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-apple-500" />
        {label}
      </div>
    </div>
  );
}
