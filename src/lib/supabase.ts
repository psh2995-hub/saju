import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { ReadingKind } from "./products";

export type ReadingRow = {
  id: string;
  kind: ReadingKind;
  input: Record<string, unknown>;
  chart: Record<string, unknown>;
  price: number;
  status: "unpaid" | "paid" | "refunded";
  payment_id: string | null;
  paid_at: string | null;
  ai_status: "none" | "generating" | "done" | "failed";
  ai_started_at: string | null;
  ai_result: string | null;
  created_at: string;
};

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
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db().from("readings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as unknown as ReadingRow | null;
}
