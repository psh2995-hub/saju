import "server-only";
import type { Json } from "./database.types";
import type { Currency } from "./i18n";
import { parseOrderId, tossAmount } from "./order";
import { db, getFollowup, getReading } from "./supabase";

export type SyncResult =
  | { ok: true; readingId: string; status: "paid" | "refunded" | "pending" }
  | { ok: false; error: string };

const TOSS_API = "https://api.tosspayments.com/v1";

/** 토스페이먼츠 Payment 객체 중 여기서 쓰는 필드 */
type TossPayment = {
  paymentKey: string;
  orderId: string;
  status: string;
  currency: string;
  totalAmount: number;
  approvedAt: string | null;
};

type TossError = { code?: string; message?: string };

/** 결제창형 연동 시크릿 키. 통화마다 MID(상점)가 달라 키도 따로 받는다. */
function secretKey(currency: Currency) {
  const key = currency === "USD" ? process.env.TOSS_SECRET_KEY_USD : process.env.TOSS_SECRET_KEY;
  if (!key) throw new Error(`${currency === "USD" ? "TOSS_SECRET_KEY_USD" : "TOSS_SECRET_KEY"} 환경 변수가 필요합니다.`);
  return key;
}

async function toss<T>(currency: Currency, path: string, init?: { body: unknown; idempotencyKey: string }) {
  const res = await fetch(`${TOSS_API}${path}`, {
    method: init ? "POST" : "GET",
    headers: {
      // 시크릿 키 뒤에 콜론을 붙여 base64로 인코딩한다(비밀번호 없음).
      Authorization: `Basic ${Buffer.from(`${secretKey(currency)}:`).toString("base64")}`,
      "Content-Type": "application/json",
      ...(init ? { "Idempotency-Key": init.idempotencyKey } : {}),
    },
    body: init ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return res.ok ? ({ ok: true, data: data as T } as const) : ({ ok: false, error: data as TossError } as const);
}

type Target = {
  table: "readings" | "followups";
  id: string;
  readingId: string;
  price: number;
  currency: Currency;
  status: string;
  paymentId: string | null;
};

/** 주문번호(r-… / f-…)로 결제 대상을 찾는다. */
async function findTarget(orderId: unknown): Promise<Target | null> {
  const order = parseOrderId(orderId);
  if (!order) return null;
  if (order.type === "followup") {
    const f = await getFollowup(order.id);
    return f && { table: "followups", id: f.id, readingId: f.reading_id, price: f.price, currency: f.currency as Currency, status: f.status, paymentId: f.payment_id };
  }
  const r = await getReading(order.id);
  return r && { table: "readings", id: r.id, readingId: r.id, price: r.price, currency: r.currency, status: r.status, paymentId: r.payment_id };
}

/**
 * 토스페이먼츠 Payment 객체를 DB에 반영한다. 결제 승인 직후와 웹훅이 모두 이 함수를 호출하므로
 * 여러 번 불려도 결과가 같아야 한다.
 */
async function applyPayment(payment: TossPayment, target: Target): Promise<SyncResult> {
  // 토스페이먼츠 금액(원·달러)을 DB 단위(원·센트)로 바꿔 비교한다.
  const amount = target.currency === "USD" ? Math.round(payment.totalAmount * 100) : payment.totalAmount;
  await db()
    .from("payments")
    .upsert(
      {
        payment_id: payment.orderId,
        reading_id: target.readingId,
        followup_id: target.table === "followups" ? target.id : null,
        amount,
        status: payment.status,
        raw: payment as unknown as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "payment_id" },
    );

  if (payment.status === "DONE") {
    if (amount !== target.price || payment.currency !== target.currency) {
      console.error("payment amount mismatch", payment.orderId, payment.totalAmount, payment.currency);
      return { ok: false, error: "결제 금액이 상품 가격과 일치하지 않습니다. 고객센터로 문의해 주세요." };
    }
    if (target.status === "unpaid") {
      await db()
        .from(target.table)
        .update({ status: "paid", payment_id: payment.orderId, paid_at: payment.approvedAt ?? new Date().toISOString() })
        .eq("id", target.id)
        .eq("status", "unpaid");
    }
    // 이미 다른 결제로 열린 대상에 중복 결제가 들어온 경우 payments 테이블에만 남는다. 관리자가 환불 처리한다.
    return { ok: true, readingId: target.readingId, status: "paid" };
  }

  if ((payment.status === "CANCELED" || payment.status === "PARTIAL_CANCELED") && target.paymentId === payment.orderId) {
    await db().from(target.table).update({ status: "refunded" }).eq("id", target.id);
    return { ok: true, readingId: target.readingId, status: "refunded" };
  }

  // WAITING_FOR_DEPOSIT(가상계좌 입금 대기) 등. 입금되면 웹훅으로 다시 반영된다.
  return { ok: true, readingId: target.readingId, status: "pending" };
}

/**
 * 결제창 인증 후 successUrl로 돌아온 브라우저가 넘긴 값으로 결제를 승인한다.
 * 금액은 브라우저 값을 믿지 않고 DB의 상품 가격과 비교한 뒤, 맞을 때만 승인 API를 부른다.
 */
export async function confirmPayment(input: { paymentKey: string; orderId: string; amount: number }): Promise<SyncResult> {
  const target = await findTarget(input.orderId);
  if (!target) return { ok: false, error: "결제와 연결된 풀이를 찾을 수 없습니다." };

  const amount = tossAmount(target.price, target.currency);
  if (input.amount !== amount) return { ok: false, error: "결제 금액이 상품 가격과 일치하지 않습니다." };
  if (target.status === "paid") {
    if (target.paymentId === input.orderId) return { ok: true, readingId: target.readingId, status: "paid" };
    // 다른 탭에서 이미 결제했다. 승인하지 않으면 이 결제는 10분 뒤 자동으로 만료되어 청구되지 않는다.
    return { ok: false, error: "이미 결제된 풀이입니다. 페이지를 새로고침해 주세요." };
  }
  if (target.status !== "unpaid") return { ok: false, error: "결제할 수 없는 상태입니다." };

  // 같은 주문을 두 번 승인 요청해도(새로고침 등) 멱등키 덕분에 첫 응답이 그대로 돌아온다.
  const res = await toss<TossPayment>(target.currency, "/payments/confirm", {
    body: { paymentKey: input.paymentKey, orderId: input.orderId, amount },
    idempotencyKey: `confirm-${input.orderId}`,
  });
  if (res.ok) return applyPayment(res.data, target);
  if (res.error.code === "ALREADY_PROCESSED_PAYMENT") return syncPayment(input.paymentKey, input.orderId);
  console.error("payment confirm failed", input.orderId, res.error);
  return { ok: false, error: res.error.message ?? "결제 승인에 실패했습니다." };
}

/** 토스페이먼츠에서 결제를 다시 조회해 DB에 반영한다(웹훅·중복 승인 처리). */
export async function syncPayment(paymentKey: string, orderId: string): Promise<SyncResult> {
  const target = await findTarget(orderId);
  if (!target) return { ok: false, error: "결제와 연결된 풀이를 찾을 수 없습니다." };
  const res = await toss<TossPayment>(target.currency, `/payments/${encodeURIComponent(paymentKey)}`);
  if (!res.ok) return { ok: false, error: res.error.message ?? "결제 조회에 실패했습니다." };
  if (res.data.orderId !== orderId) return { ok: false, error: "주문번호가 일치하지 않습니다." };
  return applyPayment(res.data, target);
}

/** PG 심사 전 테스트용. ALLOW_MOCK_PAYMENT=true일 때만 결제 없이 풀이를 연다. */
export function mockPaymentAllowed() {
  return process.env.ALLOW_MOCK_PAYMENT === "true";
}
