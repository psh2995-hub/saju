import { NextResponse } from "next/server";
import { syncPayment } from "@/lib/payments";

/** 결제창이 닫힌 직후 브라우저가 호출한다. 결제 결과는 포트원에 직접 조회해 검증한다. */
export async function POST(request: Request) {
  const { paymentId } = (await request.json().catch(() => ({}))) as { paymentId?: unknown };
  if (typeof paymentId !== "string" || !paymentId) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  try {
    const result = await syncPayment(paymentId);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result);
  } catch (e) {
    console.error("payment sync failed", paymentId, e);
    return NextResponse.json({ error: "결제 확인 중 오류가 발생했습니다. 잠시 후 새로고침해 주세요." }, { status: 500 });
  }
}
