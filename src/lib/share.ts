import { calculateGunghap, type GunghapChart, type GunghapInput } from "./gunghap";
import { ILJU_SUMMARY } from "./ilju";
import { TEN_GOD_YEAR, type NewYearChart } from "./newyear";
import type { Element, SajuChart } from "./saju";
import type { ReadingRow } from "./supabase";
import type { TarotChart } from "./tarot";

export type SharePillar = { label: string; gan: string; zhi: string; ganElement: Element; zhiElement: Element };

/**
 * 공유 페이지·공유 이미지에 쓰는 요약. 이름·생년월일·질문 같은 개인 정보는 넣지 않는다.
 */
export type ShareSummary = {
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
