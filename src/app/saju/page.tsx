import type { Metadata } from "next";
import { SajuForm } from "./SajuForm";

export const metadata: Metadata = { title: "사주 풀이" };

export default function SajuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">사주 풀이</h1>
        <p className="mt-2 text-sm text-muted">생년월일시를 입력하면 사주팔자 명식과 오행, 대운을 무료로 보여드립니다.</p>
      </div>
      <SajuForm />
    </div>
  );
}
