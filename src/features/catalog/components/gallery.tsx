"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export interface GalleryImage {
  readonly path: string;
  readonly alt: string;
}

interface GalleryProps {
  readonly images: readonly GalleryImage[];
  readonly fallbackLabel: string;
}

/**
 * Product gallery: main image with hover/tap zoom + thumbnail strip.
 * Renders a placeholder block when the product has no media yet.
 */
export function Gallery({ images, fallbackLabel }: GalleryProps): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const active = images[activeIndex];

  if (!active) {
    return (
      <div
        role="img"
        aria-label={fallbackLabel}
        className="flex aspect-square w-full items-center justify-center rounded-lg bg-secondary text-6xl font-semibold text-muted-foreground"
      >
        {fallbackLabel.trim().charAt(0).toUpperCase() || "•"}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg border"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onClick={() => setZoomed((prev) => !prev)}
      >
        <Image
          src={active.path}
          alt={active.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className={cn(
            "object-cover transition-transform duration-150",
            zoomed && "scale-[1.75]",
          )}
          style={{ transformOrigin: origin }}
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.path}
              type="button"
              aria-label={image.alt}
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border",
                index === activeIndex && "ring-2 ring-primary",
              )}
            >
              <Image src={image.path} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
