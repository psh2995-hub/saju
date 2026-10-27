import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/payments";

/** 결제창 인증 후 successUrl로 돌아온 브라우저가 호출한다. 서버가 금액을 검증하고 토스페이먼츠에 결제 승인을 요청한다. */
export async function POST(request: Request) {
  const { paymentKey, orderId, amount } = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (typeof paymentKey !== "string" || !paymentKey || paymentKey.length > 200 || typeof orderId !== "string" || typeof value !== "number" || !Number.isFinite(value)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  try {
    const result = await confirmPayment({ paymentKey, orderId, amount: value });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result);
  } catch (e) {
    console.error("payment confirm failed", orderId, e);
    return NextResponse.json({ error: "결제 확인 중 오류가 발생했습니다. 잠시 후 새로고침해 주세요." }, { status: 500 });
  }
}
