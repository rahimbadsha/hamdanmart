import { ShoppingCart, User } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { localized } from "@/lib/i18n/content";
import { findCategoryTree } from "@/features/catalog/repositories/category-repository";
import { computeTotals, getCart } from "@/features/cart/services/cart-service";
import type { AppLocale } from "@/i18n/routing";

import { SearchBox } from "@/features/catalog/components/search-box";

export async function StorefrontHeader(): Promise<React.ReactElement> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations();
  const [user, cart, categories] = await Promise.all([
    getCurrentUser(),
    getCart(),
    findCategoryTree(),
  ]);
  const { itemCount } = computeTotals(cart);

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          {t("common.appName")}
        </Link>

        <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1 sm:px-4">
          <SearchBox />
        </div>

        <nav className="order-2 ml-auto flex items-center gap-1 sm:order-3">
          <Link
            href={user ? "/account" : "/login"}
            aria-label={user ? t("auth.myAccount") : t("auth.loginButton")}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
          >
            <User className="size-4" />
            <span className="hidden md:inline">
              {user ? user.name.split(" ")[0] : t("auth.loginButton")}
            </span>
          </Link>
          <Link
            href="/cart"
            aria-label={t("cart.title")}
            className="relative flex items-center rounded-md px-2 py-1.5 hover:bg-secondary"
          >
            <ShoppingCart className="size-4" />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            ) : null}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>

      {categories.length > 0 ? (
        <nav
          aria-label={t("common.categories")}
          className="mx-auto w-full max-w-6xl overflow-x-auto px-4"
        >
          <ul className="flex gap-1 pb-2">
            <li>
              <Link
                href="/products"
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm hover:bg-secondary"
              >
                {t("catalog.allProducts")}
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm hover:bg-secondary"
                >
                  {localized(category, "name", locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
