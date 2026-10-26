import "server-only";
import { Solar } from "lunar-javascript";
import { generateDaily, type DailyText } from "./ai";
import { GAN_ELEMENT, GAN_KO, koGanZhi, tenGod } from "./saju";
import { db } from "./supabase";
import { todayKST } from "./time";

export const DAY_GANS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;

export type DailyFortune = DailyText & { ymd: string; dayGan: string; todayGanZhi: string; todayKo: string; ganTenGod: string; zhiTenGod: string };

export function todayGanZhi(now = new Date()) {
  const t = todayKST(now);
  return { ...t, ganZhi: Solar.fromYmd(t.y, t.m, t.d).getLunar().getDayInGanZhi() };
}

/** (오늘, 일간) 조합의 운세를 캐시에서 꺼내고, 없으면 만들어 저장한다. 하루 최대 10건만 생성된다. */
export async function getDailyFortune(dayGan: string, now = new Date()): Promise<DailyFortune> {
  const t = todayGanZhi(now);
  const ganTenGod = tenGod(dayGan, t.ganZhi[0]);
  const zhiTenGod = tenGod(dayGan, t.ganZhi[1]);
  const base = { ymd: t.ymd, dayGan, todayGanZhi: t.ganZhi, todayKo: koGanZhi(t.ganZhi), ganTenGod, zhiTenGod };

  const { data: cached } = await db()
    .from("daily_fortunes")
    .select("*")
    .eq("fortune_date", t.ymd)
    .eq("day_gan", dayGan)
    .maybeSingle();
  if (cached) {
    const [body, tip = ""] = cached.body.split("\n\n오늘의 실천: ");
    return { ...base, summary: cached.summary, body, tip };
  }

  const text = await generateDaily({
    ymd: t.ymd,
    dayGan,
    dayGanKo: GAN_KO[dayGan],
    dayElement: GAN_ELEMENT[dayGan],
    todayGanZhi: t.ganZhi,
    ganTenGod,
    zhiTenGod,
  });
  // 동시에 두 요청이 생성했다면 먼저 저장된 것을 유지한다.
  await db()
    .from("daily_fortunes")
    .upsert(
      { fortune_date: t.ymd, day_gan: dayGan, day_ganzhi: t.ganZhi, summary: text.summary, body: `${text.body}\n\n오늘의 실천: ${text.tip}` },
      { onConflict: "fortune_date,day_gan", ignoreDuplicates: true },
    );
  return { ...base, ...text };
}

export function isDayGan(v: unknown): v is (typeof DAY_GANS)[number] {
  return typeof v === "string" && (DAY_GANS as readonly string[]).includes(v);
}
