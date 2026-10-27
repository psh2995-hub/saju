import "server-only";
import { PaymentClient } from "@portone/server-sdk";
import type { Json } from "./database.types";
import { db, getFollowup, getReading } from "./supabase";

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

type Target = {
  table: "readings" | "followups";
  id: string;
  readingId: string;
  price: number;
  currency: string;
  status: string;
  paymentId: string | null;
};

/** 결제 customData({ readingId } 또는 { followupId })로 결제 대상을 찾는다. */
async function findTarget(customData: string | undefined): Promise<Target | null> {
  let data: { readingId?: unknown; followupId?: unknown } = {};
  try {
    data = JSON.parse(customData ?? "{}");
  } catch {}
  if (typeof data.followupId === "string") {
    const f = await getFollowup(data.followupId);
    return f && { table: "followups", id: f.id, readingId: f.reading_id, price: f.price, currency: f.currency, status: f.status, paymentId: f.payment_id };
  }
  if (typeof data.readingId === "string") {
    const r = await getReading(data.readingId);
    return r && { table: "readings", id: r.id, readingId: r.id, price: r.price, currency: r.currency, status: r.status, paymentId: r.payment_id };
  }
  return null;
}

/**
 * 포트원에서 결제 건을 직접 조회해 DB에 반영한다.
 * 브라우저에서 넘어온 값은 결제 ID만 믿고, 금액·상태·결제 대상은 모두 포트원 응답으로 검증한다.
 * 결제 완료 콜백과 웹훅이 모두 이 함수를 호출하므로 여러 번 불려도 결과가 같아야 한다.
 */
export async function syncPayment(paymentId: string): Promise<SyncResult> {
  const payment = await portone().getPayment({ paymentId });
  if (!("id" in payment)) return { ok: false, error: "알 수 없는 결제 상태입니다." };

  const target = await findTarget(payment.customData);
  if (!target) return { ok: false, error: "결제와 연결된 풀이를 찾을 수 없습니다." };

  await db()
    .from("payments")
    .upsert(
      {
        payment_id: paymentId,
        reading_id: target.readingId,
        followup_id: target.table === "followups" ? target.id : null,
        amount: payment.amount.total,
        status: payment.status,
        raw: payment as unknown as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "payment_id" },
    );

  if (payment.status === "PAID") {
    // 금액은 통화의 최소 단위(원·센트)로 비교한다.
    if (payment.amount.total !== target.price || payment.currency !== target.currency) {
      return { ok: false, error: "결제 금액이 상품 가격과 일치하지 않습니다. 고객센터로 문의해 주세요." };
    }
    if (target.status === "unpaid") {
      await db()
        .from(target.table)
        .update({ status: "paid", payment_id: paymentId, paid_at: payment.paidAt })
        .eq("id", target.id)
        .eq("status", "unpaid");
    }
    // 이미 다른 결제로 열린 대상에 중복 결제가 들어온 경우 payments 테이블에만 남는다. 관리자가 환불 처리한다.
    return { ok: true, readingId: target.readingId, status: "paid" };
  }

  if (payment.status === "CANCELLED" && target.paymentId === paymentId) {
    await db().from(target.table).update({ status: "refunded" }).eq("id", target.id);
    return { ok: true, readingId: target.readingId, status: "refunded" };
  }

  return { ok: true, readingId: target.readingId, status: "pending" };
}

/** PG 심사 전 테스트용. ALLOW_MOCK_PAYMENT=true일 때만 결제 없이 풀이를 연다. */
export function mockPaymentAllowed() {
  return process.env.ALLOW_MOCK_PAYMENT === "true";
}
