import { NextResponse } from "next/server";
import { mockPaymentAllowed } from "@/lib/payments";
import { db } from "@/lib/supabase";

/** PG 심사 전 전체 흐름을 테스트하기 위한 가짜 결제. ALLOW_MOCK_PAYMENT=true일 때만 동작한다. */
export async function POST(request: Request) {
  if (!mockPaymentAllowed()) return NextResponse.json({ error: "사용할 수 없습니다." }, { status: 404 });
  const { readingId, followupId } = (await request.json().catch(() => ({}))) as { readingId?: unknown; followupId?: unknown };
  const [table, id] =
    typeof followupId === "string" ? (["followups", followupId] as const) : typeof readingId === "string" ? (["readings", readingId] as const) : [];
  if (!table || !id) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const { error } = await db()
    .from(table)
    .update({ status: "paid", payment_id: `mock_${id}`, paid_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "unpaid");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
