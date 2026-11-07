import { db } from "@/lib/supabase";

/**
 * Supabase 무료 플랜은 7일 동안 요청이 없으면 프로젝트를 일시정지한다.
 * Vercel Cron(vercel.json)이 매일 이 주소를 불러 가벼운 조회를 한 번 보낸다.
 * Vercel은 CRON_SECRET 환경 변수가 있으면 Authorization: Bearer <값>을 붙여 부른다.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { count, error } = await db().from("readings").select("id", { count: "exact", head: true });
  if (error) {
    console.error("keepalive failed", error);
    return new Response("error", { status: 500 });
  }
  return Response.json({ ok: true, readings: count });
}
