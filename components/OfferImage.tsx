"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

interface OfferImageProps {
  src: string;
  alt: string;
  price: number;
}

/**
 * Loads a Leboncoin image directly in the browser. Shows a shimmer while
 * loading and a graceful frosted gradient fallback if the URL fails, so the
 * grid always looks intentional.
 */
export function OfferImage({ src, alt }: OfferImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-apple-50 to-apple-100">
      {error ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-apple-50 via-white to-apple-100">
          <ImageOff className="h-11 w-11 text-apple-300" strokeWidth={1.5} />
        </div>
      ) : (
        <>
          {!loaded && <div className="absolute inset-0 shimmer" />}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`h-full w-full object-cover transition-opacity duration-700 ease-out ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* soft top sheen for the glass feel */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/25" />
        </>
      )}
    </div>
  );
}
