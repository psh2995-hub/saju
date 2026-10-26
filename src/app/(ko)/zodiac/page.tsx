import type { Metadata } from "next";
import { ZodiacForm } from "@/components/ReadingForm";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "별자리" };

export default function ZodiacPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <PageHeader eyebrow="ZODIAC" title="별자리">
        태어난 순간의 실제 천체 위치로 태양·달·상승궁, 그리고 수성·금성·화성의 별자리를 무료로 보여드립니다. 생일만 알면 태양 별자리, 시각과 도시까지
        알면 더 정확해집니다.
      </PageHeader>
      <ZodiacForm />
    </div>
  );
}
