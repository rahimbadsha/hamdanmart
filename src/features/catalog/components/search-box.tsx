"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { formatBDT } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

interface Suggestion {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly pricePoisha: number;
}

const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

export function SearchBox(): React.ReactElement {
  const t = useTranslations("search");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<readonly Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    const controller = new AbortController();
    const tooShort = trimmed.length < MIN_QUERY_LENGTH;
    const timer = setTimeout(
      async () => {
        if (tooShort) {
          setSuggestions([]);
          setOpen(false);
          return;
        }
        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(trimmed)}&locale=${locale}`,
            { signal: controller.signal },
          );
          if (!response.ok) return;
          const data = (await response.json()) as { suggestions: Suggestion[] };
          setSuggestions(data.suggestions);
          setOpen(data.suggestions.length > 0);
        } catch {
          // aborted or network error — ignore, suggestions are best-effort
        }
      },
      tooShort ? 0 : DEBOUNCE_MS,
    );
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, locale]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent): void {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function onSubmit(event: React.FormEvent): void {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={onSubmit} role="search">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(suggestions.length > 0)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          className="pl-9"
        />
      </form>
      {open ? (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <Link
                href={`/product/${suggestion.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-secondary"
              >
                <span className="line-clamp-1">{suggestion.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {formatBDT(suggestion.pricePoisha, locale)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
