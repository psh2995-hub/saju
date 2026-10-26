import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import { Mark } from "@/components/ui";
import { siteUrl } from "@/lib/share";
import { BUSINESS, PENDING, SITE_NAME } from "@/lib/site";
import "./globals.css";

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

const NAV = [
  ["/saju", "사주"],
  ["/gunghap", "궁합"],
  ["/newyear", "신년운세"],
  ["/tarot", "타로"],
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME} — 사주·타로`, template: `%s | ${SITE_NAME}` },
  description: "타고난 시간을 읽고 가야 할 길을 비추는 사주·타로 풀이",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${nanumSquare.variable} ${hanja.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 bg-canvas/85 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl flex-col px-5 sm:h-16 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex h-14 items-center gap-2.5 text-[17px] font-bold text-ink sm:h-auto">
              <Mark className="size-6 text-gold" />
              {SITE_NAME}
            </Link>
            <div className="-mx-5 flex gap-5 overflow-x-auto px-5 pb-3 text-sm whitespace-nowrap text-muted sm:mx-0 sm:px-0 sm:pb-0">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-ink">
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-24 border-t border-line bg-surface-1 text-sm text-muted">
          <div className="mx-auto max-w-5xl px-5 py-14">
            <p className="flex items-center gap-2.5 text-base font-bold text-ink">
              <Mark className="size-5 text-gold" />
              {SITE_NAME}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-body">
              <Link href="/terms" className="hover:text-gold">이용약관</Link>
              <Link href="/privacy" className="font-bold hover:text-gold">개인정보처리방침</Link>
              <Link href="/refund" className="hover:text-gold">환불정책</Link>
            </div>
            <div className="mt-6 space-y-1 text-[13px] leading-6">
              <p>
                상호 {BUSINESS.companyName ?? SITE_NAME} · 대표 {BUSINESS.ceo ?? PENDING} · 사업자등록번호{" "}
                {BUSINESS.registrationNumber ?? PENDING}
              </p>
              <p>
                통신판매업신고 {BUSINESS.mailOrderNumber ?? PENDING} · 주소 {BUSINESS.address ?? PENDING}
              </p>
              <p>
                고객센터 {BUSINESS.phone ?? PENDING} · {BUSINESS.email ?? PENDING}
              </p>
            </div>
            <p className="mt-6 border-t border-line pt-6 text-xs leading-5 text-muted-soft">
              모든 풀이는 AI가 명리학·타로 이론을 바탕으로 작성한 참고용 콘텐츠이며, 의학·법률·투자 등 전문적인 판단을
              대신하지 않습니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
