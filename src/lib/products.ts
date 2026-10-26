import type { Lang } from "./i18n";

export const PRODUCTS = {
  saju: { name: "사주 정밀 풀이", price: 9900 },
  tarot: { name: "타로 심층 해석", price: 3900 },
  gunghap: { name: "궁합 정밀 풀이", price: 12900 },
  newyear: { name: "신년운세", price: 9900 },
  zodiac: { name: "별자리 풀이", price: 4900 },
} as const;

export type ReadingKind = keyof typeof PRODUCTS;

/** 해외(영문) 페이지에서 파는 상품과 이름. 첫 화면에 이 순서로 나온다(별자리가 맨 앞). */
export const PRODUCT_NAMES_EN = {
  zodiac: "Zodiac Reading",
  tarot: "Tarot Reading",
  newyear: "K-Zodiac Forecast",
  saju: "Korean Birth Chart Reading",
} as const satisfies Partial<Record<ReadingKind, string>>;

export type EnKind = keyof typeof PRODUCT_NAMES_EN;

export const isEnKind = (kind: string): kind is EnKind => kind in PRODUCT_NAMES_EN;

/** 별자리 풀이는 영문 전용, 궁합은 한국어 전용 */
export const isKindAvailable = (kind: ReadingKind, lang: Lang) => (lang === "en" ? isEnKind(kind) : kind !== "zodiac");

/** 결제한 풀이에 이어서 묻는 추가 질문 1회 */
export const FOLLOWUP = { name: "추가 질문", price: 2900 } as const;

export function formatWon(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}
