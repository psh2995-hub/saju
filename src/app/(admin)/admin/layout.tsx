import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/ui";
import { SITE_NAME } from "@/lib/site";
import { fontVariables } from "../../fonts";
import "../../globals.css";

export const metadata: Metadata = {
  title: { default: `관리자 | ${SITE_NAME}`, template: `%s | ${SITE_NAME} 관리자` },
  robots: { index: false, follow: false },
};

const NAV = [
  ["/admin", "대시보드"],
  ["/admin/readings", "풀이·결제 내역"],
  ["/admin/security", "보안"],
] as const;

/** 관리자 화면 루트 레이아웃. 인증은 각 화면의 requireAdmin()이 한다. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="ko" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-line bg-surface-1">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-sm">
            <Link href="/admin" prefetch={false} className="flex items-center gap-2 font-bold text-ink">
              <Mark className="size-5 text-gold" />
              {SITE_NAME} 관리자
            </Link>
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} prefetch={false} className="text-muted hover:text-ink">
                {label}
              </Link>
            ))}
            <form action="/api/admin/logout" method="post" className="ml-auto">
              <button className="text-muted hover:text-ink">로그아웃</button>
            </form>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">{children}</main>
      </body>
    </html>
  );
}
