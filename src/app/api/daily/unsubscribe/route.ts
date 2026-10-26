import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

/** 수신 거부. 알림톡 하단 링크(/unsubscribe/{token})의 버튼이 호출한다. */
export async function POST(request: Request) {
  const { token } = (await request.json().catch(() => ({}))) as { token?: unknown };
  if (typeof token !== "string" || !/^[0-9a-f-]{36}$/i.test(token)) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  // 수신을 끊으면 더 보관할 이유가 없으므로 번호를 바로 삭제한다.
  const { error } = await db().from("daily_subscribers").delete().eq("unsubscribe_token", token);
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
