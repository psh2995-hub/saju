import Link from "next/link";
import { Eyebrow, ghostButtonClass, Mark } from "@/components/ui";
import { ILJU_SUMMARY } from "@/lib/ilju";
import { formatWon, PRODUCTS } from "@/lib/products";
import { SITE_NAME } from "@/lib/site";

const SAMPLE_PILLARS = [
  { label: "시주", gan: "己", zhi: "巳" },
  { label: "일주", gan: "己", zhi: "卯" },
  { label: "월주", gan: "癸", zhi: "丑" },
  { label: "연주", gan: "壬", zhi: "午" },
];

const PRODUCT_CARDS = [
  {
    href: "/saju",
    eyebrow: "SAJU",
    title: "사주 풀이",
    text: "생년월일시로 사주팔자·일주·오행·대운을 무료로 확인하고, 성격·재물·직업·연애·건강과 올해·내년 운세까지 정밀 풀이를 받아보세요.",
    free: "명식 무료 · 정밀 풀이",
    price: PRODUCTS.saju.price,
  },
  {
    href: "/gunghap",
    eyebrow: "GUNGHAP",
    title: "궁합",
    text: "그 사람과 나, 진짜 맞을까? 두 사람의 일주·오행·띠로 끌림과 부딪히는 지점, 앞으로의 흐름까지 풀어 드립니다.",
    free: "궁합 포인트 무료 · 정밀 풀이",
    price: PRODUCTS.gunghap.price,
  },
  {
    href: "/newyear",
    eyebrow: "NEW YEAR",
    title: "신년운세",
    text: "다가오는 한 해가 내 명식에 주는 기운과 달마다의 흐름. 재물·직업·연애·건강을 월별로 미리 살펴보세요.",
    free: "세운·월운 무료 · 월별 풀이",
    price: PRODUCTS.newyear.price,
  },
  {
    href: "/tarot",
    eyebrow: "TAROT",
    title: "타로 리딩",
    text: "마음에 걸린 질문을 떠올리며 세 장의 카드를 고르세요. 카드의 의미는 무료, 질문에 맞춘 심층 해석은 유료입니다.",
    free: "카드 의미 무료 · 심층 해석",
    price: PRODUCTS.tarot.price,
  },
];

export default function Home() {
  return (
    <div>
      {/* 히어로 */}
      <section className="mx-auto grid max-w-5xl items-center gap-12 px-5 pt-16 pb-20 md:grid-cols-[1.3fr_1fr] md:pt-24">
        <div>
          <Eyebrow>四柱 · TAROT</Eyebrow>
          <h1 className="mt-5 text-[32px] leading-[1.25] font-normal text-ink sm:text-[48px]">
            <span className="sm:whitespace-nowrap">타고난 시간을 읽으면</span>
            <br />
            <span className="sm:whitespace-nowrap">가야 할 길이 보입니다</span>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-8 text-muted">
            {SITE_NAME}은 정통 만세력으로 당신의 사주 명식을 세우고, 지금 걷는 길에 필요한 이야기를 정성껏 들려드립니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/saju" className="inline-flex h-14 items-center bg-gold px-8 text-base text-black transition hover:bg-gold-dark hover:text-ink">
              무료로 사주 보기
            </Link>
            <Link href="/tarot" className={ghostButtonClass}>
              타로 카드 뽑기
            </Link>
          </div>
        </div>

        {/* 실제 결과 화면 일부를 보여 주는 카드 */}
        <div className="bg-surface-1 p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>사주 명식</span>
            <span>2003.01.06 · 巳時</span>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-1.5 text-center">
            {SAMPLE_PILLARS.map((p) => (
              <div key={p.label}>
                <p className="mb-2 text-[11px] text-muted-soft">{p.label}</p>
                <p className="bg-surface-2 py-3 font-[family-name:var(--font-hanja)] text-3xl text-ink">{p.gan}</p>
                <p className="mt-1.5 bg-surface-2 py-3 font-[family-name:var(--font-hanja)] text-3xl text-ink">{p.zhi}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-xs text-gold">일주 己卯(기묘) — {ILJU_SUMMARY["己卯"].title}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{ILJU_SUMMARY["己卯"].text}</p>
          </div>
        </div>
      </section>

      {/* 상품 */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="grid gap-px bg-line md:grid-cols-2">
          {PRODUCT_CARDS.map((p) => (
            <Link key={p.href} href={p.href} className="group bg-canvas p-8 transition hover:bg-surface-1 sm:p-10">
              <Eyebrow>{p.eyebrow}</Eyebrow>
              <p className="mt-4 text-[28px] text-ink">{p.title}</p>
              <p className="mt-3 text-[15px] leading-7 text-muted">{p.text}</p>
              <p className="mt-8 flex items-baseline justify-between border-t border-line pt-5 text-sm text-muted">
                {p.free}
                <span className="text-xl text-ink">{formatWon(p.price)}</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 이용 안내 */}
      <section className="mx-auto mt-24 max-w-5xl px-5">
        <div className="flex items-center gap-3">
          <Mark className="size-5 text-gold" />
          <h2 className="text-xl text-ink">이용 안내</h2>
        </div>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            ["가입 없이", "회원가입 없이 바로 이용합니다. 결과 페이지 주소를 저장해 두면 언제든 다시 볼 수 있습니다."],
            ["1~3분 안에", "결제하면 AI 상담가가 곧바로 당신만을 위한 풀이를 작성합니다."],
            ["참고용 콘텐츠", "풀이는 오락·참고용입니다. 중요한 결정은 전문가와 상의하세요."],
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
