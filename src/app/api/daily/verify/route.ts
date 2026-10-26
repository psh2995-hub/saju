import { NextResponse } from "next/server";
import { isDayGan } from "@/lib/daily";
import { hashCode, normalizePhone } from "@/lib/phone";
import { db } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { phone?: unknown; code?: unknown; dayGan?: unknown };
  const phone = normalizePhone(body.phone);
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!phone || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "인증번호 6자리를 입력해 주세요." }, { status: 400 });

  const { data: sub } = await db().from("daily_subscribers").select("*").eq("phone", phone).maybeSingle();
  if (!sub?.verify_code_hash || !sub.verify_expires_at || new Date(sub.verify_expires_at) < new Date()) {
    return NextResponse.json({ error: "인증번호가 만료되었습니다. 다시 요청해 주세요." }, { status: 400 });
  }
  if (sub.verify_attempts >= 5) return NextResponse.json({ error: "시도 횟수를 넘었습니다. 다시 요청해 주세요." }, { status: 429 });

  if (sub.verify_code_hash !== hashCode(phone, code)) {
    await db().from("daily_subscribers").update({ verify_attempts: sub.verify_attempts + 1 }).eq("id", sub.id);
    return NextResponse.json({ error: "인증번호가 맞지 않습니다." }, { status: 400 });
  }
  await db()
    .from("daily_subscribers")
    .update({
      ...(isDayGan(body.dayGan) ? { day_gan: body.dayGan } : {}),
      verified_at: new Date().toISOString(),
      active: true,
      verify_code_hash: null,
      verify_expires_at: null,
      verify_attempts: 0,
    })
    .eq("id", sub.id);
  return NextResponse.json({ ok: true });
}
