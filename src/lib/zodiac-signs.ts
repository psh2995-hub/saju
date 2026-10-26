// 서양 별자리(태양궁). 클라이언트(입력 화면 미리보기)에서도 쓰므로 다른 모듈을 import하지 않는다.

export type SignKey =
  | "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo"
  | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";

export type Sign = {
  key: SignKey;
  name: string;
  /** 이모지가 아닌 글자 모양으로 보이게 텍스트 표현 선택자(U+FE0E)를 붙인다. */
  symbol: string;
  /** 시작일 [월, 일] — 일반적으로 쓰는 경계일 기준 */
  from: [number, number];
  dates: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  ruler: string;
  /** 황금새벽회 대응에 따른 별자리의 메이저 아르카나 번호 */
  card: number;
  keywords: string;
};

export const SIGNS: Sign[] = [
  { key: "aries", name: "Aries", symbol: "♈\uFE0E", from: [3, 21], dates: "Mar 21 – Apr 19", element: "Fire", modality: "Cardinal", ruler: "Mars", card: 4, keywords: "bold, pioneering, impatient" },
  { key: "taurus", name: "Taurus", symbol: "♉\uFE0E", from: [4, 20], dates: "Apr 20 – May 20", element: "Earth", modality: "Fixed", ruler: "Venus", card: 5, keywords: "steady, sensual, stubborn" },
  { key: "gemini", name: "Gemini", symbol: "♊\uFE0E", from: [5, 21], dates: "May 21 – Jun 20", element: "Air", modality: "Mutable", ruler: "Mercury", card: 6, keywords: "curious, witty, restless" },
  { key: "cancer", name: "Cancer", symbol: "♋\uFE0E", from: [6, 21], dates: "Jun 21 – Jul 22", element: "Water", modality: "Cardinal", ruler: "the Moon", card: 7, keywords: "caring, protective, moody" },
  { key: "leo", name: "Leo", symbol: "♌\uFE0E", from: [7, 23], dates: "Jul 23 – Aug 22", element: "Fire", modality: "Fixed", ruler: "the Sun", card: 8, keywords: "warm, proud, generous" },
  { key: "virgo", name: "Virgo", symbol: "♍\uFE0E", from: [8, 23], dates: "Aug 23 – Sep 22", element: "Earth", modality: "Mutable", ruler: "Mercury", card: 9, keywords: "precise, helpful, self-critical" },
  { key: "libra", name: "Libra", symbol: "♎\uFE0E", from: [9, 23], dates: "Sep 23 – Oct 22", element: "Air", modality: "Cardinal", ruler: "Venus", card: 11, keywords: "fair, charming, indecisive" },
  { key: "scorpio", name: "Scorpio", symbol: "♏\uFE0E", from: [10, 23], dates: "Oct 23 – Nov 21", element: "Water", modality: "Fixed", ruler: "Pluto and Mars", card: 13, keywords: "intense, loyal, secretive" },
  { key: "sagittarius", name: "Sagittarius", symbol: "♐\uFE0E", from: [11, 22], dates: "Nov 22 – Dec 21", element: "Fire", modality: "Mutable", ruler: "Jupiter", card: 14, keywords: "adventurous, honest, restless" },
  { key: "capricorn", name: "Capricorn", symbol: "♑\uFE0E", from: [12, 22], dates: "Dec 22 – Jan 19", element: "Earth", modality: "Cardinal", ruler: "Saturn", card: 15, keywords: "ambitious, disciplined, reserved" },
  { key: "aquarius", name: "Aquarius", symbol: "♒\uFE0E", from: [1, 20], dates: "Jan 20 – Feb 18", element: "Air", modality: "Fixed", ruler: "Uranus and Saturn", card: 17, keywords: "original, idealistic, detached" },
  { key: "pisces", name: "Pisces", symbol: "♓\uFE0E", from: [2, 19], dates: "Feb 19 – Mar 20", element: "Water", modality: "Mutable", ruler: "Neptune and Jupiter", card: 18, keywords: "dreamy, compassionate, sensitive" },
];

/** 생일(월·일)의 태양 별자리 */
export function sunSign(month: number, day: number): Sign {
  const md = month * 100 + day;
  // 시작일이 생일과 같거나 이른 별자리 중 가장 늦게 시작하는 것. 없으면(1월 1~19일) 전년 12월 22일에 시작한 염소자리.
  const started = SIGNS.filter((s) => s.from[0] * 100 + s.from[1] <= md);
  const latest = (a: Sign, b: Sign) => (b.from[0] * 100 + b.from[1] > a.from[0] * 100 + a.from[1] ? b : a);
  return started.length ? started.reduce(latest) : SIGNS.find((s) => s.key === "capricorn")!;
}
