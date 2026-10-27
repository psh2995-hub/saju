// 결제 주문번호와 금액 변환. 클라이언트(결제창)와 서버(승인)가 함께 쓴다.
import type { Currency } from "./i18n";

export type OrderTarget = { type: "reading" | "followup"; id: string };

/**
 * 토스페이먼츠 orderId(영문·숫자·`-`·`_`, 6~64자). 결제 대상(풀이 r / 추가 질문 f)과 ID를 담아서
 * 리다이렉트로 돌아왔을 때나 웹훅을 받았을 때 주문번호만으로 대상을 찾을 수 있게 한다.
 */
export function createOrderId(target: OrderTarget) {
  return `${target.type === "reading" ? "r" : "f"}-${target.id.replaceAll("-", "")}-${Date.now().toString(36)}`;
}

export function parseOrderId(orderId: unknown): OrderTarget | null {
  const m = typeof orderId === "string" ? /^([rf])-([0-9a-f]{32})-[0-9a-z]+$/.exec(orderId) : null;
  if (!m) return null;
  const h = m[2];
  const id = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  return { type: m[1] === "r" ? "reading" : "followup", id };
}

/** DB 금액(KRW 원, USD 센트)을 토스페이먼츠 금액(KRW 원, USD 달러·소수점 둘째 자리)으로 바꾼다. */
export function tossAmount(price: number, currency: Currency) {
  return currency === "USD" ? price / 100 : price;
}

/** 결제창에서 successUrl·failUrl로 돌아왔을 때의 쿼리. 성공이면 paymentKey·amount가, 실패·취소면 code·message가 있다. */
export type PaymentRedirect = {
  orderId: string;
  paymentKey: string | null;
  amount: string | null;
  code: string | null;
  message: string | null;
  /** 추가 질문 결제였다면 그 ID */
  followupId: string | null;
};

export function readPaymentRedirect(query: Record<string, string | string[] | undefined>): PaymentRedirect | null {
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : null);
  const orderId = one(query.orderId);
  const order = parseOrderId(orderId);
  if (!orderId || !order) return null;
  return {
    orderId,
    paymentKey: one(query.paymentKey),
    amount: one(query.amount),
    code: one(query.code),
    message: one(query.message),
    followupId: order.type === "followup" ? order.id : null,
  };
}
