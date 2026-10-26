import type { Metadata } from "next";
import { SingleBirthForm } from "@/components/ReadingForm";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "사주 풀이" };

export default function SajuPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <PageHeader eyebrow="SAJU" title="사주 풀이">
        생년월일시를 입력하면 사주팔자 명식과 일주, 오행, 대운을 무료로 보여드립니다.
      </PageHeader>
      <SingleBirthForm kind="saju" submitLabel="무료로 내 사주 보기" />
    </div>
  );
}
