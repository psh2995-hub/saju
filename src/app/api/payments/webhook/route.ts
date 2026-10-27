import { syncPayment } from "@/lib/payments";

/**
 * 토스페이먼츠 웹훅(PAYMENT_STATUS_CHANGED). 승인 후 DB 반영이 끊겼거나 상점관리자에서 결제를 취소했을 때 상태를 맞춘다.
 * 결제 웹훅에는 서명이 없으므로 본문은 paymentKey·orderId만 쓰고, 상태는 결제 조회 API로 다시 확인한다.
 * 개발자센터 > 웹훅에 https://<도메인>/api/payments/webhook 을 등록한다.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { eventType?: unknown; data?: { paymentKey?: unknown; orderId?: unknown } } | null;
  const { paymentKey, orderId } = body?.data ?? {};
  if (body?.eventType !== "PAYMENT_STATUS_CHANGED" || typeof paymentKey !== "string" || typeof orderId !== "string") {
    return new Response("ignored");
  }
  try {
    const result = await syncPayment(paymentKey, orderId);
    if (!result.ok) console.error("webhook sync failed", orderId, result.error);
  } catch (e) {
    // 500을 돌려주면 토스페이먼츠가 웹훅을 다시 보낸다.
    console.error("webhook sync error", orderId, e);
    return new Response("error", { status: 500 });
  }
  return new Response("ok");
}
