import { NextResponse } from "next/server";
import { streamFollowup } from "@/lib/ai";
import { streamAndSave, textResponse } from "@/lib/generation";
import { db, getFollowup, getFollowups, getReading } from "@/lib/supabase";

export const maxDuration = 300;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const followup = await getFollowup(id);
  if (!followup) return NextResponse.json({ error: "질문을 찾을 수 없습니다." }, { status: 404 });
  if (followup.status !== "paid") return NextResponse.json({ error: "결제가 필요합니다." }, { status: 402 });
  if (followup.ai_status === "done" && followup.ai_result) return textResponse(followup.ai_result);

  const reading = await getReading(followup.reading_id);
  if (!reading) return NextResponse.json({ error: "풀이를 찾을 수 없습니다." }, { status: 404 });

  const { data: claimed, error } = await db().rpc("claim_followup_generation", { p_id: id });
  if (error) throw error;
  if (!claimed) return NextResponse.json({ status: "generating" }, { status: 409 });

  const previous = (await getFollowups(reading.id)).filter((f) => f.id !== id && f.created_at < followup.created_at);
  return streamAndSave(streamFollowup(reading, previous, followup), {
    onDone: (text) => db().from("followups").update({ ai_status: "done", ai_result: text }).eq("id", id),
    onFail: (e) => {
      console.error("followup generation failed", id, e);
      return db().from("followups").update({ ai_status: "failed" }).eq("id", id);
    },
  });
}
