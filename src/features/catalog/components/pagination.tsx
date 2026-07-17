import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface PaginationProps {
  readonly page: number;
  readonly pageCount: number;
  readonly basePath: string;
  readonly searchParams: Readonly<Record<string, string | undefined>>;
}

function pageHref(
  basePath: string,
  searchParams: Readonly<Record<string, string | undefined>>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && key !== "page") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export async function Pagination({
  page,
  pageCount,
  basePath,
  searchParams,
}: PaginationProps): Promise<React.ReactElement | null> {
  if (pageCount <= 1) return null;
  const t = await getTranslations("catalog");

  return (
    <nav
      aria-label={t("pagination")}
      className="flex items-center justify-center gap-3 pt-6"
    >
      {page > 1 ? (
        <Link
          href={pageHref(basePath, searchParams, page - 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          {t("previous")}
        </Link>
      ) : null}
      <span className="text-sm text-muted-foreground">
        {t("pageOf", { page, pageCount })}
      </span>
      {page < pageCount ? (
        <Link
          href={pageHref(basePath, searchParams, page + 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          {t("next")}
        </Link>
      ) : null}
    </nav>
  );
}
