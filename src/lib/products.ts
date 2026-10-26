export const PRODUCTS = {
  saju: { name: "사주 정밀 풀이", price: 9900 },
  tarot: { name: "타로 심층 해석", price: 3900 },
  gunghap: { name: "궁합 정밀 풀이", price: 12900 },
  newyear: { name: "신년운세", price: 9900 },
} as const;

export type ReadingKind = keyof typeof PRODUCTS;

/** 결제한 풀이에 이어서 묻는 추가 질문 1회 */
export const FOLLOWUP = { name: "추가 질문", price: 2900 } as const;

export function formatWon(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}
