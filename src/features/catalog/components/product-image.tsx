import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductImageProps {
  readonly path?: string | null;
  readonly alt: string;
  readonly className?: string;
  readonly sizes?: string;
  readonly priority?: boolean;
}

/**
 * Product image with graceful fallback. Real media arrives with the media
 * manager (Phase 6); until then most products render the placeholder.
 */
export function ProductImage({
  path,
  alt,
  className,
  sizes = "(max-width: 640px) 50vw, 25vw",
  priority = false,
}: ProductImageProps): React.ReactElement {
  if (!path) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex aspect-square w-full items-center justify-center bg-secondary text-3xl font-semibold text-muted-foreground",
          className,
        )}
      >
        {alt.trim().charAt(0).toUpperCase() || "•"}
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-square w-full overflow-hidden", className)}>
      <Image
        src={path}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
