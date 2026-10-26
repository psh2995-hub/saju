import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { GunghapView } from "@/components/GunghapView";
import { NewYearView } from "@/components/NewYearView";
import { ReadingActions } from "@/components/ReadingActions";
import { SajuChartView } from "@/components/SajuChartView";
import { ShareBar } from "@/components/ShareBar";
import { TarotView } from "@/components/TarotView";
import { ZodiacTarotView } from "@/components/en/ZodiacTarotView";
import type { GunghapChart, GunghapInput } from "@/lib/gunghap";
import type { NewYearChart } from "@/lib/newyear";
import { mockPaymentAllowed } from "@/lib/payments";
import { PRODUCTS } from "@/lib/products";
import type { SajuChart, SajuInput } from "@/lib/saju";
import { getFollowups, getReading, type ReadingRow } from "@/lib/supabase";
import type { TarotChart, TarotInput } from "@/lib/tarot";
import type { ZodiacTarotChart, ZodiacTarotInput } from "@/lib/zodiac";

export const metadata: Metadata = { title: "풀이 결과", robots: { index: false } };

export default function ReadingPage(props: PageProps<"/r/[id]">) {
  return (
    <Suspense fallback={<p className="animate-pulse py-24 text-center text-muted">풀이를 불러오는 중…</p>}>
      <Reading {...props} />
    </Suspense>
  );
}

const DESCRIPTION: Record<ReadingRow["kind"], string> = {
  saju: "위 명식을 바탕으로 성격·재물·직업·연애·건강, 대운과 올해·내년 운세까지 AI 상담가가 당신만을 위한 긴 풀이를 작성합니다.",
  newyear: "한 해의 총운과 재물·직업·연애·건강, 그리고 달마다의 흐름을 월별로 자세히 풀어 드립니다.",
  gunghap: "두 사람의 명식을 함께 놓고 끌림, 대화 방식, 부딪히는 지점과 푸는 법, 앞으로의 흐름까지 풀어 드립니다.",
  tarot: "뽑은 세 장의 카드를 질문에 맞춰 하나의 이야기로 엮어 심층 해석해 드립니다.",
  zodiac: "별자리 카드와 뽑은 세 장의 카드를 질문에 맞춰 하나의 이야기로 엮어 심층 해석해 드립니다.",
};

function productName(reading: ReadingRow) {
  if (reading.kind === "newyear") return `${(reading.chart as unknown as NewYearChart).year.year}년 ${PRODUCTS.newyear.name}`;
  return PRODUCTS[reading.kind].name;
}

function ChartView({ reading }: { reading: ReadingRow }) {
  const input = reading.input as never;
  switch (reading.kind) {
    case "saju":
      return <SajuChartView input={input as SajuInput} chart={reading.chart as unknown as SajuChart} />;
    case "newyear":
      return <NewYearView input={input as SajuInput} chart={reading.chart as unknown as NewYearChart} />;
    case "gunghap":
      return <GunghapView input={input as GunghapInput} chart={reading.chart as unknown as GunghapChart} />;
    case "tarot":
      return <TarotView input={input as TarotInput} chart={reading.chart as unknown as TarotChart} />;
    case "zodiac":
      return <ZodiacTarotView input={input as ZodiacTarotInput} chart={reading.chart as unknown as ZodiacTarotChart} />;
  }
}

async function Reading({ params, searchParams }: PageProps<"/r/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : null);
  const paymentId = one(query.paymentId);
  const reading = await getReading(id);
  if (!reading) notFound();
  // 해외(영문) 페이지에서 만든 풀이는 영문 결과 페이지에서 연다.
  if (reading.lang === "en") {
    const qs = new URLSearchParams(Object.entries(query).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : []))).toString();
    redirect(`/en/r/${id}${qs ? `?${qs}` : ""}`);
  }
  const followups = reading.status === "paid" ? await getFollowups(reading.id) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-px px-5 pt-14">
      <ChartView reading={reading} />
      <ShareBar shareId={reading.share_id} title={productName(reading)} />
      <ReadingActions
        readingId={reading.id}
        productName={productName(reading)}
        price={reading.price}
        status={reading.status}
        result={reading.ai_status === "done" ? reading.ai_result : null}
        followups={followups}
        mockPayment={mockPaymentAllowed()}
        paymentRedirect={paymentId ? { paymentId, code: one(query.code), message: one(query.message), followupId: one(query.for) } : null}
        description={DESCRIPTION[reading.kind]}
      />
    </div>
  );
}
