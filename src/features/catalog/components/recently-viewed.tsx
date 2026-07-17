"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { formatBDT } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

import type { RecentProduct } from "../types";

/**
 * Recently viewed products — stored client-side in localStorage
 * (works for guests, no tracking table needed).
 */

const STORAGE_KEY = "hm_recently_viewed";
const MAX_ITEMS = 8;

function readRecent(): RecentProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentProduct[]) : [];
  } catch {
    return [];
  }
}

/**
 * localStorage as an external store — SSR-safe (server snapshot is empty)
 * and updates across tabs via the storage event.
 */
function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

interface RecordRecentlyViewedProps {
  readonly product: RecentProduct;
}

/** Invisible — records the visited product on mount. */
export function RecordRecentlyViewed({ product }: RecordRecentlyViewedProps): null {
  useEffect(() => {
    const existing = readRecent().filter((entry) => entry.slug !== product.slug);
    const next = [product, ...existing].slice(0, MAX_ITEMS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage full/blocked — non-critical
    }
  }, [product]);
  return null;
}

interface RecentlyViewedProps {
  readonly excludeSlug?: string;
}

export function RecentlyViewed({
  excludeSlug,
}: RecentlyViewedProps): React.ReactElement | null {
  const t = useTranslations("catalog");
  const locale = useLocale() as AppLocale;
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const items = useMemo<readonly RecentProduct[]>(() => {
    try {
      const parsed: unknown = JSON.parse(raw);
      const list = Array.isArray(parsed) ? (parsed as RecentProduct[]) : [];
      return list.filter((entry) => entry.slug !== excludeSlug);
    } catch {
      return [];
    }
  }, [raw, excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{t("recentlyViewed")}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/product/${item.slug}`}
            className="w-36 shrink-0 rounded-lg border p-3 transition-shadow hover:shadow-sm"
          >
            <span className="line-clamp-2 text-sm">
              {locale === "bn" ? item.nameBn : item.nameEn}
            </span>
            <span className="mt-1 block text-sm font-semibold">
              {formatBDT(item.pricePoisha, locale)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
