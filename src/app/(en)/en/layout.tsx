import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/ui";
import { SITE_NAME_EN } from "@/lib/i18n";
import { siteUrl } from "@/lib/share";
import { BUSINESS } from "@/lib/site";
import { fontVariables } from "../../fonts";
import "../../globals.css";

const NAV = [
  ["/en/zodiac-tarot", "Zodiac Tarot"],
  ["/en/forecast", "K-Zodiac Forecast"],
  ["/en/saju", "Birth Chart"],
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME_EN} — Zodiac Tarot & Korean Astrology`, template: `%s | ${SITE_NAME_EN}` },
  description: "Zodiac tarot readings and Korean astrology (Saju) forecasts, from a little fortune café in Korea.",
  alternates: { languages: { ko: "/", en: "/en" } },
};

const PENDING = "Pending";

export default function EnglishLayout({ children }: LayoutProps<"/en">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 bg-canvas/85 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl flex-col px-5 sm:h-16 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex h-14 items-center justify-between sm:h-auto">
              <Link href="/en" className="flex items-center gap-2.5 text-[17px] font-bold text-ink">
                <Mark className="size-6 text-gold" />
                {SITE_NAME_EN}
              </Link>
              <Link href="/?lang=ko" prefetch={false} className="text-xs text-muted hover:text-ink sm:hidden">
                한국어
              </Link>
            </div>
            <div className="-mx-5 flex gap-5 overflow-x-auto px-5 pb-3 text-sm whitespace-nowrap text-muted sm:mx-0 sm:px-0 sm:pb-0">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-ink">
                  {label}
                </Link>
              ))}
              <Link href="/?lang=ko" prefetch={false} className="hidden border-l border-line-strong pl-5 hover:text-ink sm:block">
                한국어
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-24 border-t border-line bg-surface-1 text-sm text-muted">
          <div className="mx-auto max-w-5xl px-5 py-14">
            <p className="flex items-center gap-2.5 text-base font-bold text-ink">
              <Mark className="size-5 text-gold" />
              {SITE_NAME_EN}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-body">
              <Link href="/terms" className="hover:text-gold">Terms (Korean)</Link>
              <Link href="/privacy" className="font-bold hover:text-gold">Privacy (Korean)</Link>
              <Link href="/refund" className="hover:text-gold">Refunds (Korean)</Link>
            </div>
            <div className="mt-6 space-y-1 text-[13px] leading-6">
              <p>
                {BUSINESS.companyName ?? SITE_NAME_EN} · CEO {BUSINESS.ceo ?? PENDING} · Business registration {BUSINESS.registrationNumber ?? PENDING}
              </p>
              <p>
                Mail-order registration {BUSINESS.mailOrderNumber ?? PENDING} · {BUSINESS.address ?? PENDING}
              </p>
              <p>Contact {BUSINESS.email ?? PENDING}</p>
            </div>
            <p className="mt-6 border-t border-line pt-6 text-xs leading-5 text-muted-soft">
              Every reading is written by AI based on tarot, Western astrology and Korean Saju traditions. It is meant for entertainment and reflection,
              and is not medical, legal or financial advice. Prices are charged in Korean won (KRW); dollar amounts are approximate.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
