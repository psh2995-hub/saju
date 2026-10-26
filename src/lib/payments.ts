import "server-only";
import { PaymentClient } from "@portone/server-sdk";
import type { Json } from "./database.types";
import { db, getReading } from "./supabase";

export type SyncResult =
  | { ok: true; readingId: string; status: "paid" | "refunded" | "pending" }
  | { ok: false; error: string };

let client: ReturnType<typeof PaymentClient> | null = null;
function portone() {
  if (!client) {
    const secret = process.env.PORTONE_API_SECRET;
    if (!secret) throw new Error("PORTONE_API_SECRET 환경 변수가 필요합니다.");
    client = PaymentClient({ secret });
  }
  return client;
}

/**
 * 포트원에서 결제 건을 직접 조회해 DB에 반영한다.
 * 브라우저에서 넘어온 값은 결제 ID만 믿고, 금액·상태·대상 풀이는 모두 포트원 응답으로 검증한다.
 * 결제 완료 콜백과 웹훅이 모두 이 함수를 호출하므로 여러 번 불려도 결과가 같아야 한다.
 */
export async function syncPayment(paymentId: string): Promise<SyncResult> {
  const payment = await portone().getPayment({ paymentId });
  if (!("id" in payment)) return { ok: false, error: "알 수 없는 결제 상태입니다." };

  let readingId: string | undefined;
  try {
    readingId = JSON.parse(payment.customData ?? "{}").readingId;
  } catch {}
  if (!readingId) return { ok: false, error: "결제와 연결된 풀이를 찾을 수 없습니다." };

  const reading = await getReading(readingId);
  if (!reading) return { ok: false, error: "풀이를 찾을 수 없습니다." };

  await db()
    .from("payments")
    .upsert(
      { payment_id: paymentId, reading_id: reading.id, amount: payment.amount.total, status: payment.status, raw: payment as unknown as Json, updated_at: new Date().toISOString() },
      { onConflict: "payment_id" },
    );

  if (payment.status === "PAID") {
    if (payment.amount.total !== reading.price || payment.currency !== "KRW") {
      return { ok: false, error: "결제 금액이 상품 가격과 일치하지 않습니다. 고객센터로 문의해 주세요." };
    }
    if (reading.status === "unpaid") {
      await db()
        .from("readings")
        .update({ status: "paid", payment_id: paymentId, paid_at: payment.paidAt })
        .eq("id", reading.id)
        .eq("status", "unpaid");
    }
    // 이미 다른 결제로 열린 풀이에 중복 결제가 들어온 경우 payments 테이블에만 남는다. 관리자가 환불 처리한다.
    return { ok: true, readingId: reading.id, status: "paid" };
  }

  if (payment.status === "CANCELLED" && reading.payment_id === paymentId) {
    await db().from("readings").update({ status: "refunded" }).eq("id", reading.id);
    return { ok: true, readingId: reading.id, status: "refunded" };
  }

  return { ok: true, readingId: reading.id, status: "pending" };
}

/** PG 심사 전 테스트용. ALLOW_MOCK_PAYMENT=true일 때만 결제 없이 풀이를 연다. */
export function mockPaymentAllowed() {
  return process.env.ALLOW_MOCK_PAYMENT === "true";
}
