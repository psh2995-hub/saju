import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { NewYearViewEn } from "@/components/en/NewYearViewEn";
import { SajuChartViewEn } from "@/components/en/SajuChartViewEn";
import { ZodiacView } from "@/components/en/ZodiacView";
import { ReadingActions } from "@/components/ReadingActions";
import { TarotView } from "@/components/TarotView";
import type { NewYearChart } from "@/lib/newyear";
import { mockPaymentAllowed } from "@/lib/payments";
import { isEnKind, PRODUCT_NAMES_EN, type EnKind } from "@/lib/products";
import type { SajuChart, SajuInput } from "@/lib/saju";
import { getFollowups, getReading, type ReadingRow } from "@/lib/supabase";
import type { TarotChart, TarotInput } from "@/lib/tarot";
import type { ZodiacChart, ZodiacInput } from "@/lib/zodiac";

export const metadata: Metadata = { title: "Your reading", robots: { index: false } };

export default function EnReadingPage(props: PageProps<"/en/r/[id]">) {
  return (
    <Suspense fallback={<p className="animate-pulse py-24 text-center text-muted">Loading your reading…</p>}>
      <Reading {...props} />
    </Suspense>
  );
}

const DESCRIPTION: Record<EnKind, string> = {
  zodiac:
    "Your Big Three read together, then love, work and money, your element balance and the year ahead under Jupiter and Saturn, with a Korean zodiac twist.",
  tarot: "Your three cards woven into one story that answers your question, with practical advice.",
  newyear:
    "The year at a glance, then money, career, love and health, and a month-by-month guide from February through next January, all read from your own chart.",
  saju: "Your core nature, five elements, wealth, career, love, health, your ten-year luck cycles and the next two years, in one in-depth reading.",
};

function productName(reading: ReadingRow & { kind: EnKind }) {
  if (reading.kind === "newyear") return `${(reading.chart as unknown as NewYearChart).year.year} ${PRODUCT_NAMES_EN.newyear}`;
  return PRODUCT_NAMES_EN[reading.kind];
}

function ChartView({ reading }: { reading: ReadingRow & { kind: EnKind } }) {
  const input = reading.input as never;
  switch (reading.kind) {
    case "zodiac":
      return <ZodiacView input={input as ZodiacInput} chart={reading.chart as unknown as ZodiacChart} />;
    case "tarot":
      return <TarotView input={input as TarotInput} chart={reading.chart as unknown as TarotChart} lang="en" />;
    case "newyear":
      return <NewYearViewEn input={input as SajuInput} chart={reading.chart as unknown as NewYearChart} />;
    case "saju":
      return <SajuChartViewEn input={input as SajuInput} chart={reading.chart as unknown as SajuChart} />;
  }
}

async function Reading({ params, searchParams }: PageProps<"/en/r/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : null);
  const reading = await getReading(id);
  if (!reading) notFound();
  // 한국어로 만든 풀이는 한국어 결과 페이지에서 연다(결제 후 돌아온 쿼리도 그대로 넘긴다).
  if (reading.lang !== "en" || !isEnKind(reading.kind)) {
    const qs = new URLSearchParams(Object.entries(query).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : []))).toString();
    redirect(`/r/${id}${qs ? `?${qs}` : ""}`);
  }
  const r = reading as ReadingRow & { kind: EnKind };
  const paymentId = one(query.paymentId);
  const followups = reading.status === "paid" ? await getFollowups(reading.id) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-px px-5 pt-14">
      <ChartView reading={r} />
      <ReadingActions
        readingId={reading.id}
        productName={productName(r)}
        price={reading.price}
        status={reading.status}
        result={reading.ai_status === "done" ? reading.ai_result : null}
        followups={followups}
        mockPayment={mockPaymentAllowed()}
        paymentRedirect={paymentId ? { paymentId, code: one(query.code), message: one(query.message), followupId: one(query.for) } : null}
        description={DESCRIPTION[r.kind]}
        lang="en"
      />
    </div>
  );
}
