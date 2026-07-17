"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";

const SORTS = ["newest", "priceAsc", "priceDesc", "nameAsc"] as const;

/**
 * Filter/sort controls. State lives in the URL — results are
 * server-rendered, shareable, and SEO-friendly.
 */
export function FiltersBar(): React.ReactElement {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>): void => {
      const params = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page"); // filters changed — back to page 1
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="sort">{t("sortLabel")}</Label>
        <Select
          value={searchParams.get("sort") ?? "newest"}
          onValueChange={(value) => updateParams({ sort: value })}
        >
          <SelectTrigger id="sort" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((sort) => (
              <SelectItem key={sort} value={sort}>
                {t(`sort.${sort}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="minPrice">{t("minPrice")}</Label>
        <Input
          id="minPrice"
          type="number"
          inputMode="numeric"
          min={0}
          className="w-24"
          defaultValue={searchParams.get("min") ?? ""}
          onBlur={(event) => updateParams({ min: event.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="maxPrice">{t("maxPrice")}</Label>
        <Input
          id="maxPrice"
          type="number"
          inputMode="numeric"
          min={0}
          className="w-24"
          defaultValue={searchParams.get("max") ?? ""}
          onBlur={(event) => updateParams({ max: event.target.value })}
        />
      </div>

      <label className="flex h-9 items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={searchParams.get("stock") === "1"}
          onChange={(event) => updateParams({ stock: event.target.checked ? "1" : null })}
        />
        {t("inStockOnly")}
      </label>
    </div>
  );
}
