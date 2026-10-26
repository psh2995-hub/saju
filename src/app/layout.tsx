import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import Link from "next/link";
import { BUSINESS, PENDING, SITE_NAME } from "@/lib/site";
import "./globals.css";

const serif = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["400", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} — 사주·타로`, template: `%s | ${SITE_NAME}` },
  description: "정통 만세력 기반 사주 풀이와 타로 해석",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-line/60">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-serif text-xl font-bold text-gold">
              {SITE_NAME}
            </Link>
            <div className="flex gap-5 text-sm text-muted">
              <Link href="/saju" className="hover:text-foreground">사주</Link>
              <Link href="/tarot" className="hover:text-foreground">타로</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</main>
        <footer className="border-t border-line/60 text-xs leading-6 text-muted">
          <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="mb-3 flex gap-4 text-foreground/80">
              <Link href="/terms">이용약관</Link>
              <Link href="/privacy" className="font-bold">개인정보처리방침</Link>
              <Link href="/refund">환불정책</Link>
            </div>
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
            <p className="mt-3">
              모든 풀이는 AI가 명리학·타로 이론을 바탕으로 작성한 참고용 콘텐츠이며, 의학·법률·투자 등 전문적인 판단을
              대신하지 않습니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
