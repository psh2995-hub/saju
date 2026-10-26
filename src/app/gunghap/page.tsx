import type { Metadata } from "next";
import { GunghapForm } from "@/components/ReadingForm";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "궁합" };

export default function GunghapPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <PageHeader eyebrow="GUNGHAP" title="궁합">
        두 사람의 생년월일시를 입력하면 일주·오행·띠로 본 궁합 포인트를 무료로 보여드립니다.
      </PageHeader>
      <GunghapForm />
    </div>
  );
}
