import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { TarotForm } from "./TarotForm";

export const metadata: Metadata = { title: "타로 리딩" };

export default function TarotPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <PageHeader eyebrow="TAROT" title="타로 리딩">
        78장의 카드를 섞어 펼쳐 두었습니다. 마음이 가는 세 장을 골라 주세요.
      </PageHeader>
      <TarotForm />
    </div>
  );
}
