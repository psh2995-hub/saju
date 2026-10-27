import { Noto_Sans_Symbols, Noto_Serif_KR } from "next/font/google";
import localFont from "next/font/local";

// 한국어·영문 루트 레이아웃이 함께 쓰는 글꼴

// 본문 글꼴: 나눔스퀘어(SIL OFL 1.1, NAVER). 원본에서 빈 글리프(한자, KS X 1001 밖의 한글)를 빼서 그 글자는 다음 글꼴로 표시된다.
// 한 굵기당 약 170KB라 미리 받지 않고 쓰이는 굵기만 내려받게 한다.
const nanumSquare = localFont({
  variable: "--font-nanum-square",
  src: [
    { path: "../fonts/NanumSquareL.woff2", weight: "300", style: "normal" },
    { path: "../fonts/NanumSquareR.woff2", weight: "400", style: "normal" },
    { path: "../fonts/NanumSquareB.woff2", weight: "700", style: "normal" },
    { path: "../fonts/NanumSquareEB.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
  preload: false,
});

// 명식의 한자 글자에만 쓴다.
const hanja = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["400", "700"],
  preload: false,
});

// 별자리 기호(♈~♓)는 기기마다 대체 글꼴이 달라 모양이 들쭉날쭉하므로 전용 글꼴로 맞춘다.
const symbols = Noto_Sans_Symbols({
  variable: "--font-noto-symbols",
  subsets: ["symbols"],
  weight: "400",
  preload: false,
});

export const fontVariables = `${nanumSquare.variable} ${hanja.variable} ${symbols.variable}`;
