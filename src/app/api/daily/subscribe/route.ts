import { NextResponse } from "next/server";
import { isDayGan } from "@/lib/daily";
import { messagingConfigured, sendVerificationSms } from "@/lib/kakao";
import { hashCode, newVerificationCode, normalizePhone } from "@/lib/phone";
import { db } from "@/lib/supabase";

/** 매일 운세 구독 신청: 휴대전화로 인증번호를 보낸다. 인증이 끝나야 발송 대상이 된다. */
export async function POST(request: Request) {
  if (!messagingConfigured()) return NextResponse.json({ error: "알림 서비스 준비 중입니다." }, { status: 503 });
  const body = (await request.json().catch(() => ({}))) as { phone?: unknown; dayGan?: unknown; agree?: unknown };
  const phone = normalizePhone(body.phone);
  if (!phone) return NextResponse.json({ error: "휴대전화 번호를 확인해 주세요." }, { status: 400 });
  if (!isDayGan(body.dayGan)) return NextResponse.json({ error: "일간을 선택해 주세요." }, { status: 400 });
  if (body.agree !== true) return NextResponse.json({ error: "개인정보 수집·이용에 동의해 주세요." }, { status: 400 });

  const { data: existing } = await db().from("daily_subscribers").select("verify_expires_at").eq("phone", phone).maybeSingle();
  // 인증번호는 1분에 한 번만 보낸다(만료 5분 기준으로 4분 이상 남았으면 최근 발송으로 본다).
  if (existing?.verify_expires_at && new Date(existing.verify_expires_at).getTime() - Date.now() > 4 * 60_000) {
    return NextResponse.json({ error: "잠시 후 다시 요청해 주세요." }, { status: 429 });
  }

  const code = newVerificationCode();
  const verify = {
    verify_code_hash: hashCode(phone, code),
    verify_expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
    verify_attempts: 0,
  };
  // 이미 구독 중인 번호의 일간은 인증이 끝난 뒤(verify)에만 바꾼다. 남의 번호로 설정을 바꾸지 못하게 하기 위함이다.
  const { error } = existing
    ? await db().from("daily_subscribers").update(verify).eq("phone", phone)
    : await db().from("daily_subscribers").insert({ phone, day_gan: body.dayGan, ...verify });
  if (error) throw error;
  await sendVerificationSms(phone, code);
  return NextResponse.json({ ok: true });
}
