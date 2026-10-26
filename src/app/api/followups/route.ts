import { NextResponse } from "next/server";
import { FOLLOWUP } from "@/lib/products";
import { db, getFollowups, getReading } from "@/lib/supabase";

/** 결제·풀이가 끝난 풀이에 추가 질문을 등록한다(결제 전 상태). */
export async function POST(request: Request) {
  const { readingId, question } = (await request.json().catch(() => ({}))) as { readingId?: unknown; question?: unknown };
  const q = typeof question === "string" ? question.trim() : "";
  if (typeof readingId !== "string" || !q) return NextResponse.json({ error: "질문을 입력해 주세요." }, { status: 400 });
  if (q.length > 300) return NextResponse.json({ error: "질문은 300자 이내로 입력해 주세요." }, { status: 400 });

  const reading = await getReading(readingId);
  if (!reading) return NextResponse.json({ error: "풀이를 찾을 수 없습니다." }, { status: 404 });
  if (reading.status !== "paid" || reading.ai_status !== "done") {
    return NextResponse.json({ error: "풀이를 먼저 받아 주세요." }, { status: 400 });
  }
  // 결제하지 않은 질문이 쌓이지 않게, 미결제 질문이 있으면 그것을 고쳐 쓴다.
  const pending = (await getFollowups(readingId)).find((f) => f.status === "unpaid");
  if (pending) {
    const { data, error } = await db().from("followups").update({ question: q }).eq("id", pending.id).select("*").single();
    if (error) throw error;
    return NextResponse.json(data);
  }
  const { data, error } = await db()
    .from("followups")
    .insert({ reading_id: readingId, question: q, price: FOLLOWUP.price })
    .select("*")
    .single();
  if (error) throw error;
  return NextResponse.json(data);
}
