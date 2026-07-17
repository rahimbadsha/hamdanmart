import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function StorefrontFooter(): Promise<React.ReactElement> {
  const t = await getTranslations();

  return (
    <footer className="mt-auto border-t bg-secondary/30">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3">
        <div>
          <p className="font-bold">{t("common.appName")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>
        <nav aria-label={t("footer.links")} className="text-sm">
          <ul className="space-y-1.5">
            <li>
              <Link href="/products" className="hover:underline">
                {t("catalog.allProducts")}
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:underline">
                {t("wishlist.title")}
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:underline">
                {t("cart.title")}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="text-sm text-muted-foreground">
          <p>{t("footer.payments")}</p>
          <p className="mt-1">{t("footer.delivery")}</p>
        </div>
      </div>
      <p className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("common.appName")}
      </p>
    </footer>
  );
}
