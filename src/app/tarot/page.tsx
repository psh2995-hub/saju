import type { Metadata } from "next";
import { TarotForm } from "./TarotForm";

export const metadata: Metadata = { title: "타로 리딩" };

export default function TarotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">타로 리딩</h1>
        <p className="mt-2 text-sm text-muted">78장의 카드를 섞어 펼쳐 두었습니다. 마음이 가는 세 장을 골라 주세요.</p>
      </div>
      <TarotForm />
    </div>
  );
}
