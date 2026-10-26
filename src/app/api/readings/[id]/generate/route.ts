import { after, NextResponse } from "next/server";
import { streamReading } from "@/lib/ai";
import { db, getReading } from "@/lib/supabase";

// AI 풀이는 수십 초~수 분이 걸린다.
export const maxDuration = 300;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reading = await getReading(id);
  if (!reading) return NextResponse.json({ error: "풀이를 찾을 수 없습니다." }, { status: 404 });
  if (reading.status !== "paid") return NextResponse.json({ error: "결제가 필요합니다." }, { status: 402 });
  if (reading.ai_status === "done" && reading.ai_result) {
    return new Response(reading.ai_result, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const { data: claimed, error } = await db().rpc("claim_ai_generation", { p_id: id });
  if (error) throw error;
  if (!claimed) {
    // 다른 요청(새로고침 전 탭 등)이 이미 생성 중이다. 클라이언트가 잠시 후 다시 요청한다.
    return NextResponse.json({ status: "generating" }, { status: 409 });
  }

  const encoder = new TextEncoder();
  const sink: { controller: ReadableStreamDefaultController<Uint8Array> | null } = { controller: null };
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      sink.controller = c;
    },
    cancel() {
      // 사용자가 페이지를 떠나도 생성은 계속하고 결과를 저장한다.
      sink.controller = null;
    },
  });

  // 응답 스트림과 별개로 생성을 끝까지 진행해 저장한다. after()가 함수 수명을 생성 완료까지 유지한다.
  const generation = (async () => {
    let text = "";
    try {
      for await (const chunk of streamReading(reading)) {
        text += chunk;
        try {
          sink.controller?.enqueue(encoder.encode(chunk));
        } catch {
          sink.controller = null;
        }
      }
      await db().from("readings").update({ ai_status: "done", ai_result: text }).eq("id", id);
      try {
        sink.controller?.close();
      } catch {}
    } catch (e) {
      console.error("AI generation failed", id, e);
      await db().from("readings").update({ ai_status: "failed" }).eq("id", id);
      try {
        sink.controller?.error(e);
      } catch {}
    }
  })();
  after(() => generation);

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
