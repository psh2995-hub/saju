import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SajuChartView } from "@/components/SajuChartView";
import { TarotView } from "@/components/TarotView";
import { mockPaymentAllowed } from "@/lib/payments";
import { PRODUCTS } from "@/lib/products";
import type { SajuChart, SajuInput } from "@/lib/saju";
import { getReading } from "@/lib/supabase";
import type { TarotChart, TarotInput } from "@/lib/tarot";
import { Unlock } from "./Unlock";

export const metadata: Metadata = { title: "풀이 결과", robots: { index: false } };

export default function ReadingPage(props: PageProps<"/r/[id]">) {
  return (
    <Suspense fallback={<p className="animate-pulse py-20 text-center text-muted">풀이를 불러오는 중…</p>}>
      <Reading {...props} />
    </Suspense>
  );
}

async function Reading({ params, searchParams }: PageProps<"/r/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : null);
  const paymentId = one(query.paymentId);
  const reading = await getReading(id);
  if (!reading) notFound();

  return (
    <div className="space-y-6">
      {reading.kind === "saju" ? (
        <SajuChartView input={reading.input as unknown as SajuInput} chart={reading.chart as unknown as SajuChart} />
      ) : (
        <TarotView input={reading.input as unknown as TarotInput} chart={reading.chart as unknown as TarotChart} />
      )}
      <Unlock
        readingId={reading.id}
        productName={PRODUCTS[reading.kind].name}
        price={reading.price}
        initialStatus={reading.status}
        initialResult={reading.ai_status === "done" ? reading.ai_result : null}
        mockPayment={mockPaymentAllowed()}
        paymentRedirect={paymentId ? { paymentId, code: one(query.code), message: one(query.message) } : null}
      />
    </div>
  );
}
