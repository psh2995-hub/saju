import Image from "next/image";
import Link from "next/link";
import { Eyebrow, ghostButtonClass, Mark } from "@/components/ui";
import { formatPrice, SITE_NAME_EN } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/products";

// 해외 방문자는 서양 별자리를 더 친숙하게 여기므로 별자리 타로를 맨 앞에 둔다.
const PRODUCT_CARDS = [
  {
    href: "/en/zodiac-tarot",
    eyebrow: "ZODIAC TAROT",
    title: "Zodiac Tarot",
    text: "Your sun sign has its own tarot card. Add three cards drawn for your question, plus your Korean zodiac animal, and get a reading that is unmistakably yours.",
    free: "Sign & cards free · in-depth reading",
    price: PRODUCTS.zodiac.price,
  },
  {
    href: "/en/forecast",
    eyebrow: "K-ZODIAC FORECAST",
    title: "Your Year, the Korean Way",
    text: "Koreans don't just ask what animal year it is — they ask what that year means for them. See the year's energy against your own chart, month by month.",
    free: "Year & monthly energy free · full forecast",
    price: PRODUCTS.newyear.price,
  },
  {
    href: "/en/saju",
    eyebrow: "SAJU · FOUR PILLARS",
    title: "Korean Birth Chart",
    text: "The centuries-old Korean way of reading destiny. Discover your Korean birth sign, your five elements and the ten-year cycles that shape your life.",
    free: "Chart free · in-depth reading",
    price: PRODUCTS.saju.price,
  },
];

export default function EnglishHome() {
  return (
    <div>
      <section className="mx-auto grid max-w-5xl items-center gap-12 px-5 pt-16 pb-20 md:grid-cols-[1.3fr_1fr] md:pt-24">
        <div>
          <Eyebrow>STARS · CARDS · 四柱</Eyebrow>
          <h1 className="mt-5 text-[32px] leading-[1.25] font-normal text-ink sm:text-[48px]">
            Your stars,
            <br />
            read the Korean way
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-8 text-muted">
            {SITE_NAME_EN} is a little fortune café from Seoul. Start with the zodiac sign you know, then meet the Korean zodiac that Koreans check
            every new year.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/en/zodiac-tarot" className="inline-flex h-14 items-center bg-gold px-8 text-base text-black transition hover:bg-gold-dark hover:text-ink">
              Draw my zodiac tarot
            </Link>
            <Link href="/en/forecast" className={ghostButtonClass}>
              My K-Zodiac forecast
            </Link>
          </div>
        </div>

        {/* 결과 화면 일부를 보여 주는 견본 */}
        <div className="bg-surface-1 p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Zodiac Tarot</span>
            <span>Born Aug 2, 1998</span>
          </div>
          <div className="mt-5 flex items-center gap-5">
            <Image src="/tarot/major-8.webp" alt="Strength, the card of Leo" width={350} height={600} unoptimized className="w-24" />
            <div>
              <p className="text-4xl text-gold">{"♌\uFE0E"}</p>
              <p className="mt-1 text-xl text-ink">Leo</p>
              <p className="mt-1 text-xs text-muted">Fire · ruled by the Sun</p>
              <p className="mt-3 text-xs text-muted">Card: Strength</p>
            </div>
          </div>
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-xs text-gold">
              Korean zodiac: Yang Earth Tiger <span className="font-[family-name:var(--font-hanja)]">戊寅</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              A Leo with a Tiger&apos;s heart: brave, independent, and happiest with room to roam.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5">
        <div className="grid gap-px bg-line md:grid-cols-3">
          {PRODUCT_CARDS.map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
              className={`group flex flex-col bg-canvas p-8 transition hover:bg-surface-1 ${i === 0 ? "border-t-2 border-gold" : ""}`}
            >
              <Eyebrow>{p.eyebrow}</Eyebrow>
              <p className="mt-4 text-[26px] leading-tight text-ink">{p.title}</p>
              <p className="mt-3 flex-1 text-[15px] leading-7 text-muted">{p.text}</p>
              <div className="mt-8 border-t border-line pt-5 text-sm text-muted">
                <p>{p.free}</p>
                <p className="mt-2 text-lg text-ink">{formatPrice(p.price, "en")}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-5xl px-5">
        <div className="flex items-center gap-3">
          <Mark className="size-5 text-gold" />
          <h2 className="text-xl text-ink">How it works</h2>
        </div>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            ["No sign-up", "Just enter your birthday. Bookmark your result page to come back any time."],
            ["Ready in minutes", "Unlock the full reading and an AI reader writes it for you on the spot, in 1–3 minutes."],
            ["For reflection", "Readings are for entertainment and reflection. Talk to a professional before big decisions."],
          ].map(([title, text], i) => (
            <li key={title} className="border-t border-line-strong pt-5">
              <p className="text-xs text-gold">0{i + 1}</p>
              <p className="mt-2 text-lg text-ink">{title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
