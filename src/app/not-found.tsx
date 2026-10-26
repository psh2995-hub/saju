import Link from "next/link";
import { Eyebrow, ghostButtonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-24 text-center">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-4 text-[32px] text-ink">길을 찾을 수 없습니다</h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">주소가 바뀌었거나 존재하지 않는 페이지입니다.</p>
      <Link href="/" className={`${ghostButtonClass} mt-10`}>
        처음으로
      </Link>
    </div>
  );
}
