import { Webhook } from "@portone/server-sdk";
import { syncPayment } from "@/lib/payments";

/**
 * 포트원 웹훅(V2). 사용자가 결제 직후 창을 닫아 /complete가 호출되지 않아도 결제가 반영되게 한다.
 * 포트원 관리자 콘솔 > 결제 연동 > 웹훅에 https://<도메인>/api/payments/webhook 을 등록한다.
 */
export async function POST(request: Request) {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!secret) return new Response("webhook secret not configured", { status: 500 });

  const payload = await request.text();
  let webhook;
  try {
    webhook = await Webhook.verify(secret, payload, Object.fromEntries(request.headers));
  } catch (e) {
    if (e instanceof Webhook.WebhookVerificationError) return new Response("invalid signature", { status: 400 });
    throw e;
  }

  if ("data" in webhook && "paymentId" in webhook.data) {
    const result = await syncPayment(webhook.data.paymentId);
    if (!result.ok) console.error("webhook sync failed", webhook.data.paymentId, result.error);
  }
  return new Response("ok");
}
