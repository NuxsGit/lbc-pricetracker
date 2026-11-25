export type BadgeKind =
  | "a-la-une"
  | "urgent"
  | "pro"
  | "baisse-prix"
  | "sponsorise";

export interface Offer {
  id: string;
  /** Ad id as a number for sorting/filtering stability */
  adId: number;
  title: string;
  /** Numeric price in euros. 0 means "price on request / exchange". */
  price: number;
  /** Raw price string as displayed by Leboncoin, e.g. "900 €" */
  priceLabel: string;
  location: string;
  city: string;
  zip: string;
  category: string;
  image: string;
  url: string;
  badges: BadgeKind[];
  sponsored: boolean;
  condition: "Neuf" | "Occasion" | "Reconditionné" | "Échange";
  shipping: string;
  /** Scraped / collected at timestamp (ms). */
  collectedAt: number;
}

export interface SearchResult {
  query: string;
  total: number;
  source: "live" | "cache";
  collectedAt: number;
  offers: Offer[];
  note?: string;
}

export type SortKey = "best" | "price-asc" | "price-desc" | "relevance";

export interface Filters {
  query: string;
  minPrice: string;
  maxPrice: string;
  category: string;
  sort: SortKey;
}
