import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export interface Crumb {
  readonly label: string;
  readonly href?: string;
}

interface BreadcrumbsProps {
  readonly crumbs: readonly Crumb[];
}

export async function Breadcrumbs({
  crumbs,
}: BreadcrumbsProps): Promise<React.ReactElement> {
  const t = await getTranslations("common");

  return (
    <nav aria-label={t("breadcrumbs")} className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:underline">
            {t("home")}
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.label} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            {crumb.href ? (
              <Link href={crumb.href} className="hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
