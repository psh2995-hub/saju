import { NextResponse } from "next/server";
import { streamReading } from "@/lib/ai";
import { streamAndSave, textResponse } from "@/lib/generation";
import { db, getReading } from "@/lib/supabase";

// AI 풀이는 수십 초~수 분이 걸린다.
export const maxDuration = 300;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reading = await getReading(id);
  if (!reading) return NextResponse.json({ error: "풀이를 찾을 수 없습니다." }, { status: 404 });
  if (reading.status !== "paid") return NextResponse.json({ error: "결제가 필요합니다." }, { status: 402 });
  if (reading.ai_status === "done" && reading.ai_result) return textResponse(reading.ai_result);

  const { data: claimed, error } = await db().rpc("claim_ai_generation", { p_id: id });
  if (error) throw error;
  // 다른 요청(새로고침 전 탭 등)이 이미 생성 중이다. 클라이언트가 잠시 후 다시 요청한다.
  if (!claimed) return NextResponse.json({ status: "generating" }, { status: 409 });

  return streamAndSave(streamReading(reading), {
    onDone: (text) => db().from("readings").update({ ai_status: "done", ai_result: text }).eq("id", id),
    onFail: (e) => {
      console.error("AI generation failed", id, e);
      return db().from("readings").update({ ai_status: "failed" }).eq("id", id);
    },
  });
}
