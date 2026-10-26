import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { Currency, Lang } from "./i18n";
import type { ReadingKind } from "./products";

export type ReadingRow = {
  id: string;
  kind: ReadingKind;
  lang: Lang;
  input: Record<string, unknown>;
  chart: Record<string, unknown>;
  /** KRW는 원, USD는 센트 단위 */
  price: number;
  currency: Currency;
  status: "unpaid" | "paid" | "refunded";
  payment_id: string | null;
  paid_at: string | null;
  ai_status: "none" | "generating" | "done" | "failed";
  ai_started_at: string | null;
  ai_result: string | null;
  share_id: string;
  created_at: string;
};

export type FollowupRow = {
  id: string;
  reading_id: string;
  question: string;
  price: number;
  currency: Currency;
  status: "unpaid" | "paid" | "refunded";
  payment_id: string | null;
  paid_at: string | null;
  ai_status: "none" | "generating" | "done" | "failed";
  ai_started_at: string | null;
  ai_result: string | null;
  created_at: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let client: ReturnType<typeof createClient<Database>> | null = null;

/** 서버 전용 클라이언트. 테이블은 RLS로 막혀 있어 secret key로만 접근할 수 있다. */
export function db() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY 환경 변수가 필요합니다.");
    client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

export async function getReading(id: string): Promise<ReadingRow | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await db().from("readings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as unknown as ReadingRow | null;
}

/** 공유 페이지용. 공유 ID로는 무료 요약만 보여 준다. */
export async function getReadingByShareId(shareId: string): Promise<ReadingRow | null> {
  if (!UUID.test(shareId)) return null;
  const { data, error } = await db().from("readings").select("*").eq("share_id", shareId).maybeSingle();
  if (error) throw error;
  return data as unknown as ReadingRow | null;
}

export async function getFollowup(id: string): Promise<FollowupRow | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await db().from("followups").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as FollowupRow | null;
}

export async function getFollowups(readingId: string): Promise<FollowupRow[]> {
  const { data, error } = await db().from("followups").select("*").eq("reading_id", readingId).order("created_at");
  if (error) throw error;
  return data as FollowupRow[];
}
