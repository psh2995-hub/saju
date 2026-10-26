import type { Metadata } from "next";
import Link from "next/link";
import { fontVariables } from "./fonts";
import "./globals.css";

// 한국어·영문 루트 레이아웃이 따로 있어 어느 쪽에도 속하지 않는 주소는 이 페이지가 받는다.
export const metadata: Metadata = { title: "404" };

export default function GlobalNotFound() {
  return (
    <html lang="ko" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full items-center justify-center px-5">
        <div className="text-center">
          <p className="text-xs tracking-[0.2em] text-gold">404</p>
          <h1 className="mt-4 text-[28px] text-ink">길을 찾을 수 없습니다</h1>
          <p className="mt-2 text-[15px] text-muted">This page could not be found.</p>
          <div className="mt-10 flex justify-center gap-3 text-sm">
            <Link href="/" prefetch={false} className="inline-flex h-12 items-center border border-ink/50 px-5 text-ink hover:bg-ink hover:text-black">
              처음으로
            </Link>
            <Link href="/en" prefetch={false} className="inline-flex h-12 items-center border border-ink/50 px-5 text-ink hover:bg-ink hover:text-black">
              English home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
