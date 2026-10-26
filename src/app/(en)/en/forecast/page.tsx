import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { EnBirthForm } from "@/components/en/forms";
import { PageHeader } from "@/components/ui";
import { kYearName } from "@/lib/en";
import { newYearTarget } from "@/lib/newyear";
import { Solar } from "lunar-javascript";

export const metadata: Metadata = {
  title: "K-Zodiac Forecast",
  description: "Your year ahead, read the Korean way: the year's zodiac energy against your Four Pillars, month by month.",
};

export default function ForecastPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <Suspense fallback={<PageHeader eyebrow="K-ZODIAC FORECAST" title="K-Zodiac Forecast" />}>
        <ForecastContent />
      </Suspense>
    </div>
  );
}

// 대상 연도는 요청 시점 기준이다(10월부터 다음 해).
async function ForecastContent() {
  await connection();
  const year = newYearTarget();
  const ganZhi = Solar.fromYmd(year, 6, 1).getLunar().getYearInGanZhiByLiChun();
  return (
    <>
      <PageHeader eyebrow="K-ZODIAC FORECAST" title={`Your ${year}, the Korean way`}>
        In Korea, {year} is the {kYearName(ganZhi)} ({ganZhi}). See what this year&apos;s energy means for your own Four Pillars, and how each month
        flows — free.
      </PageHeader>
      <EnBirthForm kind="newyear" submitLabel={`See my ${year} forecast — free`} />
    </>
  );
}
