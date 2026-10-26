import "server-only";
import { after } from "next/server";

/**
 * AI 생성 결과를 브라우저로 스트리밍하면서, 응답과 별개로 끝까지 생성해 저장한다.
 * 사용자가 페이지를 떠나도 after()가 함수 수명을 생성 완료까지 유지한다.
 */
export function streamAndSave(
  generator: AsyncGenerator<string>,
  handlers: { onDone: (text: string) => PromiseLike<unknown>; onFail: (error: unknown) => PromiseLike<unknown> },
) {
  const encoder = new TextEncoder();
  const sink: { controller: ReadableStreamDefaultController<Uint8Array> | null } = { controller: null };
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      sink.controller = c;
    },
    cancel() {
      sink.controller = null;
    },
  });

  const generation = (async () => {
    let text = "";
    try {
      for await (const chunk of generator) {
        text += chunk;
        try {
          sink.controller?.enqueue(encoder.encode(chunk));
        } catch {
          sink.controller = null;
        }
      }
      await handlers.onDone(text);
      try {
        sink.controller?.close();
      } catch {}
    } catch (e) {
      await handlers.onFail(e);
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

export function textResponse(text: string) {
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
