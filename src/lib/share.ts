import { ANIMAL_TRAIT_EN, DAY_MASTER_EN, kSign, kYearName, PILLAR_EN, romanize, TEN_GOD_EN, TEN_GOD_YEAR_EN } from "./en";
import { calculateGunghap, type GunghapChart, type GunghapInput } from "./gunghap";
import type { Lang } from "./i18n";
import { ILJU_SUMMARY } from "./ilju";
import { TEN_GOD_YEAR, type NewYearChart } from "./newyear";
import type { Element, SajuChart } from "./saju";
import type { ReadingRow } from "./supabase";
import type { TarotChart } from "./tarot";
import type { ZodiacChart } from "./zodiac";
import { POINTS, POINTS_KO, SIGN_KO, signByKey } from "./zodiac-signs";

export type SharePillar = { label: string; gan: string; zhi: string; ganElement: Element; zhiElement: Element };

/**
 * 공유 페이지·공유 이미지에 쓰는 요약. 이름·생년월일·질문 같은 개인 정보는 넣지 않는다.
 */
export type ShareSummary = {
  lang: Lang;
  eyebrow: string;
  headline: string;
  hanja?: string;
  body: string;
  pillars?: SharePillar[];
  pillarsB?: SharePillar[];
  cards?: { name: string; nameEn: string; reversed: boolean; position: string }[];
  cta: { label: string; href: string };
};

const pillarsOf = (c: SajuChart): SharePillar[] =>
  c.pillars.map((p) => ({ label: p.label, gan: p.gan, zhi: p.zhi, ganElement: p.ganElement, zhiElement: p.zhiElement }));

const iljuOf = (c: SajuChart) => {
  const d = c.pillars.find((p) => p.label === "일주")!;
  return { hanja: d.gan + d.zhi, ko: d.ganKo + d.zhiKo, ...ILJU_SUMMARY[d.gan + d.zhi] };
};

export function shareSummary(reading: ReadingRow): ShareSummary {
  const summary = reading.lang === "en" && reading.kind !== "zodiac" ? shareSummaryEn(reading) : shareSummaryKo(reading);
  return { lang: reading.lang, ...summary };
}

/** 영문 풀이의 공유 요약. 별자리는 shareSummaryKo가 언어별로 처리한다. */
function shareSummaryEn(reading: ReadingRow): Omit<ShareSummary, "lang"> {
  const pillarsEn = (c: SajuChart) => pillarsOf(c).map((p) => ({ ...p, label: PILLAR_EN[p.label] }));
  const dayOf = (c: SajuChart) => {
    const d = c.pillars.find((p) => p.label === "일주")!;
    return { hanja: d.gan + d.zhi, sign: kSign(d.gan + d.zhi), roman: romanize(d.gan + d.zhi), dm: DAY_MASTER_EN[d.gan], trait: ANIMAL_TRAIT_EN[d.zhi] };
  };
  switch (reading.kind) {
    case "newyear": {
      const c = reading.chart as unknown as NewYearChart;
      const d = dayOf(c.base);
      return {
        eyebrow: `K-Zodiac Forecast ${c.year.year}`,
        hanja: c.year.ganZhi,
        headline: `${kYearName(c.year.ganZhi)}: a year of the ${TEN_GOD_EN[c.year.ganTenGod]} for me`,
        body: `${TEN_GOD_YEAR_EN[c.year.ganTenGod]} (Korean birth sign: the ${d.sign})`,
        pillars: pillarsEn(c.base),
        cta: { label: `See your ${c.year.year} forecast`, href: "/en/forecast" },
      };
    }
    case "gunghap": {
      const c = reading.chart as unknown as GunghapChart;
      const a = dayOf(c.a);
      const b = dayOf(c.b);
      // 저장된 포인트 문장에는 이름이 들어 있으므로, 이름을 지우고 다시 계산해 "you"와 "your partner"로 표시한다.
      const input = reading.input as unknown as GunghapInput;
      const points = calculateGunghap({ a: { ...input.a, name: "" }, b: { ...input.b, name: "" } }, new Date(), "en").points;
      return {
        eyebrow: "Our K-Compatibility",
        hanja: `${a.hanja} × ${b.hanja}`,
        headline: `The ${a.sign} × the ${b.sign}`,
        body: points[0] ? `${points[0].title} — ${points[0].text}` : "Two charts that fill each other in.",
        pillars: pillarsEn(c.a),
        pillarsB: pillarsEn(c.b),
        cta: { label: "Check your compatibility", href: "/en/compatibility" },
      };
    }
    case "tarot": {
      const c = reading.chart as unknown as TarotChart;
      return {
        eyebrow: `${c.topicLabel} tarot`,
        headline: c.cards.map((card) => card.name).join(" · "),
        body: c.cards.map((card) => `${card.position}: ${card.meaning}`).join(" / "),
        cards: c.cards.map((card) => ({ name: card.name, nameEn: card.nameEn, reversed: card.reversed, position: card.position })),
        cta: { label: "Draw your own cards", href: "/en/tarot" },
      };
    }
    default: {
      const c = reading.chart as unknown as SajuChart;
      const d = dayOf(c);
      return {
        eyebrow: "My Korean birth sign",
        hanja: d.hanja,
        headline: `The ${d.sign} · ${d.roman}`,
        body: `${d.dm.title}. ${d.dm.text} ${d.trait}`,
        pillars: pillarsEn(c),
        cta: { label: "See your Korean birth chart", href: "/en/saju" },
      };
    }
  }
}

function shareSummaryKo(reading: ReadingRow): Omit<ShareSummary, "lang"> {
  switch (reading.kind) {
    case "saju": {
      const c = reading.chart as unknown as SajuChart;
      const i = iljuOf(c);
      return {
        eyebrow: "나의 일주",
        hanja: i.hanja,
        headline: `${i.ko}일주 · ${i.title}`,
        body: i.text,
        pillars: pillarsOf(c),
        cta: { label: "내 사주도 무료로 보기", href: "/saju" },
      };
    }
    case "newyear": {
      const c = reading.chart as unknown as NewYearChart;
      const i = iljuOf(c.base);
      return {
        eyebrow: `${c.year.year}년 신년운세`,
        hanja: c.year.ganZhi,
        headline: `${c.year.ko}년, 나에게는 ${c.year.ganTenGod}의 해`,
        body: `${TEN_GOD_YEAR[c.year.ganTenGod]} (${i.ko}일주)`,
        pillars: pillarsOf(c.base),
        cta: { label: `내 ${c.year.year}년 운세 보기`, href: "/newyear" },
      };
    }
    case "gunghap": {
      const c = reading.chart as unknown as GunghapChart;
      const a = iljuOf(c.a);
      const b = iljuOf(c.b);
      // 저장된 포인트 문장에는 이름이 들어 있으므로, 이름을 지우고 다시 계산해 "나"와 "상대"로 표시한다.
      const input = reading.input as unknown as GunghapInput;
      const points = calculateGunghap({ a: { ...input.a, name: "" }, b: { ...input.b, name: "" } }).points;
      const good = points.filter((p) => p.tone === "good").length;
      return {
        eyebrow: "우리의 궁합",
        hanja: `${a.hanja} × ${b.hanja}`,
        headline: `${a.title} × ${b.title}`,
        body: points[0] ? `${points[0].title} — ${points[0].text}` : `서로 잘 맞는 포인트 ${good}가지`,
        pillars: pillarsOf(c.a),
        pillarsB: pillarsOf(c.b),
        cta: { label: "우리 궁합도 무료로 보기", href: "/gunghap" },
      };
    }
    case "tarot": {
      const c = reading.chart as unknown as TarotChart;
      return {
        eyebrow: `${c.topicLabel} 타로`,
        headline: c.cards.map((card) => card.name.replace(/^\d+\.\s*/, "")).join(" · "),
        body: c.cards.map((card) => `${card.position}: ${card.meaning}`).join(" / "),
        cards: c.cards.map((card) => ({ name: card.name, nameEn: card.nameEn, reversed: card.reversed, position: card.position })),
        cta: { label: "나도 타로 카드 뽑기", href: "/tarot" },
      };
    }
    case "zodiac": {
      const c = reading.chart as unknown as ZodiacChart;
      const sun = signByKey(c.placements[0].sign);
      const big = c.placements.filter((p) => p.point === "sun" || p.point === "moon" || p.point === "rising");
      if (reading.lang === "ko") {
        return {
          eyebrow: `${SIGN_KO[sun.key].name} · 별자리`,
          hanja: c.animal.ganZhi,
          headline: big.map((p) => `${POINTS_KO[p.point].name} ${SIGN_KO[p.sign].name}`).join(" · "),
          body: `${SIGN_KO[sun.key].keywords} 사람.`,
          cta: { label: "내 별자리도 무료로 보기", href: "/zodiac" },
        };
      }
      return {
        eyebrow: `${sun.name} · Zodiac`,
        hanja: c.animal.ganZhi,
        headline: big.map((p) => `${POINTS[p.point].name} in ${signByKey(p.sign).name}`).join(" · "),
        body: `${sun.keywords}. Korean zodiac: ${c.animal.name}.`,
        cta: { label: "See your zodiac chart", href: "/en/zodiac" },
      };
    }
  }
}

export const ELEMENT_HEX: Record<Element, string> = {
  목: "#5fbf72",
  화: "#ff6b5b",
  토: "#e0a84a",
  금: "#d6d6d6",
  수: "#4ea3ff",
};

export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
