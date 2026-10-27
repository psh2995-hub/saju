import { usdPaymentsEnabled, type Currency, type Lang } from "./i18n";

export const PRODUCTS = {
  saju: { name: "사주 정밀 풀이", price: 5900 },
  tarot: { name: "타로 심층 해석", price: 3900 },
  gunghap: { name: "궁합 정밀 풀이", price: 5900 },
  newyear: { name: "신년운세", price: 4900 },
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

/** 영문 페이지에서는 영문 상품만 판다(궁합은 한국어 전용). */
export const isKindAvailable = (kind: ReadingKind, lang: Lang) => lang === "ko" || isEnKind(kind);

/** 결제한 풀이에 이어서 묻는 추가 질문 1회 */
export const FOLLOWUP = { name: "추가 질문", price: 2900 } as const;

/** 영문 상품의 달러 가격(센트). 원화 가격대를 그대로 옮겼다: 3,900원 $3 · 4,900원 $4 · 5,900원 $5. */
export const PRICES_USD: Record<EnKind, number> = { zodiac: 400, tarot: 300, newyear: 400, saju: 500 };
export const FOLLOWUP_PRICE_USD = 200;

/** 새 풀이의 결제 통화와 금액. 영문 풀이는 달러 채널이 설정돼 있을 때만 달러로 받는다. */
export function priceFor(kind: ReadingKind, lang: Lang): { price: number; currency: Currency } {
  if (lang === "en" && isEnKind(kind) && usdPaymentsEnabled()) return { price: PRICES_USD[kind], currency: "USD" };
  return { price: PRODUCTS[kind].price, currency: "KRW" };
}

export function followupPriceFor(currency: Currency) {
  return currency === "USD" ? FOLLOWUP_PRICE_USD : FOLLOWUP.price;
}

export function formatWon(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}
