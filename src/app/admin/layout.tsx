import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Inter, Noto_Sans_Bengali } from "next/font/google";

import enMessages from "@/messages/en.json";

import "../globals.css";

/**
 * Root layout for the admin area (outside the [locale] tree).
 * Admin UI is English-only; strings still flow through i18n so a Bengali
 * admin locale can be added later without rewrites.
 */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Referenced by the --font-sans chain in globals.css; without it the whole
// font-family declaration is invalid and the browser falls back to serif.
const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HamdanMart Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSansBengali.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-secondary/20 font-sans">
        <NextIntlClientProvider locale="en" messages={enMessages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
