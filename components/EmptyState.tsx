import { SearchX } from "lucide-react";

export function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full glass-strong">
        <SearchX className="h-7 w-7 text-apple-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-700">
          Aucune offre pour « {query} »
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Essayez un autre terme de recherche ou une autre catégorie.
        </p>
      </div>
    </div>
  );
}
