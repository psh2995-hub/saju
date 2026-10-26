import { NextResponse } from "next/server";
import { mockPaymentAllowed } from "@/lib/payments";
import { db } from "@/lib/supabase";

/** PG 심사 전 전체 흐름을 테스트하기 위한 가짜 결제. ALLOW_MOCK_PAYMENT=true일 때만 동작한다. */
export async function POST(request: Request) {
  if (!mockPaymentAllowed()) return NextResponse.json({ error: "사용할 수 없습니다." }, { status: 404 });
  const { readingId } = (await request.json().catch(() => ({}))) as { readingId?: unknown };
  if (typeof readingId !== "string") return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const { error } = await db()
    .from("readings")
    .update({ status: "paid", payment_id: `mock_${readingId}`, paid_at: new Date().toISOString() })
    .eq("id", readingId)
    .eq("status", "unpaid");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
