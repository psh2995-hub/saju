import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { SingleBirthForm } from "@/components/ReadingForm";
import { PageHeader } from "@/components/ui";
import { newYearTarget } from "@/lib/newyear";

export const metadata: Metadata = { title: "신년운세" };

export default function NewYearPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <Suspense fallback={<PageHeader eyebrow="NEW YEAR" title="신년운세" />}>
        <NewYearContent />
      </Suspense>
    </div>
  );
}

// 대상 연도는 요청 시점 기준이다(10월부터 다음 해). 빌드 시점에 굳지 않게 요청마다 계산한다.
async function NewYearContent() {
  await connection();
  const year = newYearTarget();
  return (
    <>
      <PageHeader eyebrow="NEW YEAR" title={`${year}년 신년운세`}>
        {year}년의 세운이 내 명식에 어떤 기운을 주는지, 달마다 어떻게 흐르는지 무료로 확인하세요.
      </PageHeader>
      <SingleBirthForm kind="newyear" submitLabel={`무료로 ${year}년 운세 보기`} />
    </>
  );
}
