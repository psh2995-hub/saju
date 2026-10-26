export const PRODUCTS = {
  saju: { name: "사주 정밀 풀이", price: 9900 },
  tarot: { name: "타로 심층 해석", price: 3900 },
} as const;

export type ReadingKind = keyof typeof PRODUCTS;

export function formatWon(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}
