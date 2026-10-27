import Link from "next/link";
import { Eyebrow, ghostButtonClass, Mark } from "@/components/ui";
import { formatPrice, SITE_NAME_EN } from "@/lib/i18n";
import { PRICES_USD } from "@/lib/products";
import { signByKey } from "@/lib/zodiac-signs";

// 해외 방문자는 서양 별자리를 더 친숙하게 여기므로 별자리를 맨 앞에, 타로를 그다음에 둔다.
const PRODUCT_CARDS = [
  {
    href: "/en/zodiac",
    eyebrow: "ZODIAC",
    title: "Zodiac Reading",
    text: "Go beyond your sun sign. Your Moon, Rising, Venus and Mars, calculated from real planet positions at the moment you were born.",
    free: "Birth chart free · in-depth reading",
    price: PRICES_USD.zodiac,
  },
  {
    href: "/en/tarot",
    eyebrow: "TAROT",
    title: "Tarot Reading",
    text: "Hold a question in mind and pick three cards from the full 78-card deck. See what they mean for free, then get a reading woven around your question.",
    free: "Card meanings free · in-depth reading",
    price: PRICES_USD.tarot,
  },
  {
    href: "/en/forecast",
    eyebrow: "K-ZODIAC FORECAST",
    title: "Your Year, the Korean Way",
    text: "Koreans don't just ask what animal year it is — they ask what that year means for them. See the year's energy against your own chart, month by month.",
    free: "Year & monthly energy free · full forecast",
    price: PRICES_USD.newyear,
  },
  {
    href: "/en/saju",
    eyebrow: "SAJU · FOUR PILLARS",
    title: "Korean Birth Chart",
    text: "The centuries-old Korean way of reading destiny. Discover your Korean birth sign, your five elements and the ten-year cycles that shape your life.",
    free: "Chart free · in-depth reading",
    price: PRICES_USD.saju,
  },
];

// 견본: 1998-08-02 08:30 뉴욕 출생의 실제 계산 결과
const SAMPLE = [
  ["Sun", "leo"],
  ["Moon", "sagittarius"],
  ["Rising", "virgo"],
] as const;

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
            {SITE_NAME_EN} is a little fortune café from Seoul. Start with the zodiac and tarot you know, then meet the Korean zodiac that Koreans
            check every new year.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/en/zodiac" className="inline-flex h-14 items-center bg-gold px-8 text-base text-black transition hover:bg-gold-dark hover:text-ink">
              Read my zodiac
            </Link>
            <Link href="/en/tarot" className={ghostButtonClass}>
              Draw tarot cards
            </Link>
          </div>
        </div>

        {/* 결과 화면 일부를 보여 주는 견본 */}
        <div className="bg-surface-1 p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Zodiac chart</span>
            <span>Aug 2, 1998 · New York</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-px bg-line text-center">
            {SAMPLE.map(([point, key]) => {
              const s = signByKey(key);
              return (
                <div key={point} className="bg-surface-2 px-2 py-5">
                  <p className="text-xs text-gold">{point}</p>
                  <p className="mt-2 font-[family-name:var(--font-symbol)] text-3xl text-ink">{s.symbol}</p>
                  <p className="mt-1 text-sm text-ink">{s.name}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-xs text-gold">
              Korean zodiac: Yang Earth Tiger <span className="font-[family-name:var(--font-hanja)]">戊寅</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              A warm Leo heart, a free-roaming Sagittarius Moon and a careful Virgo first impression — with a Tiger&apos;s courage underneath.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5">
        <div className="grid gap-px bg-line md:grid-cols-2">
          {PRODUCT_CARDS.map((p) => (
            <Link key={p.href} href={p.href} className="group bg-canvas p-8 transition hover:bg-surface-1 sm:p-10">
              <Eyebrow>{p.eyebrow}</Eyebrow>
              <p className="mt-4 text-[28px] text-ink">{p.title}</p>
              <p className="mt-3 text-[15px] leading-7 text-muted">{p.text}</p>
              <p className="mt-8 flex items-baseline justify-between border-t border-line pt-5 text-sm text-muted">
                {p.free}
                <span className="text-xl text-ink">{formatPrice(p.price, "en", "USD")}</span>
              </p>
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
            ["No sign-up", "Just enter your birthday or pick your cards. Bookmark your result page to come back any time."],
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
