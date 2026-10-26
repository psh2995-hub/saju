import { NextResponse } from "next/server";
import { getDailyFortune } from "@/lib/daily";
import { messagingConfigured, sendDailyAlimtalks } from "@/lib/kakao";
import { GAN_KO } from "@/lib/saju";
import { siteUrl } from "@/lib/share";
import { db } from "@/lib/supabase";
import { todayKST } from "@/lib/time";

export const maxDuration = 300;

/**
 * 매일 아침(vercel.json의 crons, 한국 시간 08:00) 구독자에게 오늘의 운세 알림톡을 보낸다.
 * Vercel이 Authorization: Bearer {CRON_SECRET} 헤더를 붙여 호출한다.
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("unauthorized", { status: 401 });
  }
  if (!messagingConfigured()) return NextResponse.json({ skipped: "messaging not configured" });

  const { ymd, m, d } = todayKST();
  const { data: subs, error } = await db()
    .from("daily_subscribers")
    .select("id, phone, day_gan, unsubscribe_token, last_sent_on")
    .eq("active", true);
  if (error) throw error;
  const targets = subs.filter((s) => s.last_sent_on !== ymd);

  const byGan = new Map<string, typeof targets>();
  for (const s of targets) byGan.set(s.day_gan, [...(byGan.get(s.day_gan) ?? []), s]);

  let sent = 0;
  const failed: string[] = [];
  for (const [gan, group] of byGan) {
    try {
      const f = await getDailyFortune(gan);
      await sendDailyAlimtalks(
        group.map((s) => ({
          phone: s.phone,
          variables: {
            날짜: `${m}월 ${d}일`,
            일진: `${f.todayGanZhi}(${f.todayKo})`,
            일간: `${gan}(${GAN_KO[gan]})`,
            요약: f.summary,
            링크: `${siteUrl()}/today?g=${encodeURIComponent(gan)}`,
            수신거부: `${siteUrl()}/unsubscribe/${s.unsubscribe_token}`,
          },
        })),
      );
      await db().from("daily_subscribers").update({ last_sent_on: ymd }).in("id", group.map((s) => s.id));
      sent += group.length;
    } catch (e) {
      // 한 일간 그룹이 실패해도 나머지는 보낸다. 실패한 그룹은 last_sent_on이 남지 않아 수동 재실행 시 다시 보낸다.
      console.error("daily alimtalk failed", gan, e);
      failed.push(gan);
    }
  }
  return NextResponse.json({ date: ymd, sent, failed });
}
