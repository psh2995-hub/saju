import "server-only";
import type { Currency } from "../i18n";
import type { ReadingKind } from "../products";
import { db, type FollowupRow, type ReadingRow } from "../supabase";

// 관리자 화면 전용 조회. 화면에서 requireAdmin()을 통과한 뒤에만 부른다.

/** 가짜 결제(ALLOW_MOCK_PAYMENT)로 열린 건. 매출에서 따로 센다. */
export const isMock = (paymentId: string | null) => !!paymentId?.startsWith("mock_");

/** 한국 시간 기준 날짜(YYYY-MM-DD) */
export const kstDate = (iso: string) => new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 10);

export const kstDateTime = (iso: string | null) =>
  iso ? new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 16).replace("T", " ") : "—";

type Sale = { kind: ReadingKind | "followup"; currency: Currency; price: number; paidAt: string; refunded: boolean; mock: boolean };

export type Summary = {
  periods: { label: string; count: number; krw: number; usd: number }[];
  byKind: { kind: ReadingKind | "followup"; count: number; krw: number; usd: number }[];
  daily: { date: string; count: number; krw: number; usd: number }[];
  refunds: number;
  mock: number;
  readings: number;
  paidReadings: number;
};

/** 결제 요약. 결제된(환불 포함) 풀이·추가 질문을 모두 읽어 계산한다(건수가 많아지면 DB 집계로 옮긴다). */
export async function getSummary(now = new Date()): Promise<Summary> {
  const [readings, followups, total] = await Promise.all([
    db().from("readings").select("kind, price, currency, status, payment_id, paid_at").neq("status", "unpaid").limit(10000),
    db().from("followups").select("price, currency, status, payment_id, paid_at").neq("status", "unpaid").limit(10000),
    db().from("readings").select("id", { count: "exact", head: true }),
  ]);
  if (readings.error) throw readings.error;
  if (followups.error) throw followups.error;

  const sales: Sale[] = [
    ...readings.data.map((r) => ({ kind: r.kind as ReadingKind, currency: r.currency as Currency, price: r.price, paidAt: r.paid_at ?? "", refunded: r.status === "refunded", mock: isMock(r.payment_id) })),
    ...followups.data.map((f) => ({ kind: "followup" as const, currency: f.currency as Currency, price: f.price, paidAt: f.paid_at ?? "", refunded: f.status === "refunded", mock: isMock(f.payment_id) })),
  ];
  const real = sales.filter((s) => !s.mock && !s.refunded && s.paidAt);
  const add = (acc: { count: number; krw: number; usd: number }, s: Sale) => {
    acc.count++;
    if (s.currency === "USD") acc.usd += s.price;
    else acc.krw += s.price;
    return acc;
  };
  const sum = (list: Sale[]) => list.reduce(add, { count: 0, krw: 0, usd: 0 });

  const today = kstDate(now.toISOString());
  const daysAgo = (n: number) => kstDate(new Date(now.getTime() - n * 86400_000).toISOString());
  const periods = [
    { label: "오늘", from: today },
    { label: "최근 7일", from: daysAgo(6) },
    { label: "최근 30일", from: daysAgo(29) },
    { label: "전체", from: "" },
  ].map((p) => ({ label: p.label, ...sum(real.filter((s) => kstDate(s.paidAt) >= p.from)) }));

  const kinds: (ReadingKind | "followup")[] = ["saju", "gunghap", "newyear", "tarot", "zodiac", "followup"];
  const byKind = kinds.map((kind) => ({ kind, ...sum(real.filter((s) => s.kind === kind)) }));

  const daily = Array.from({ length: 14 }, (_, i) => daysAgo(13 - i)).map((date) => ({ date, ...sum(real.filter((s) => kstDate(s.paidAt) === date)) }));

  return {
    periods,
    byKind,
    daily,
    refunds: sales.filter((s) => s.refunded).length,
    mock: sales.filter((s) => s.mock).length,
    readings: total.count ?? 0,
    paidReadings: readings.data.length,
  };
}

export type ReadingListItem = Pick<ReadingRow, "id" | "kind" | "lang" | "status" | "price" | "currency" | "payment_id" | "paid_at" | "ai_status" | "created_at"> & {
  name: string | null;
  followups: number;
};

export const PAGE_SIZE = 50;

export async function listReadings(filter: { page: number; status?: string; kind?: string; lang?: string }) {
  let q = db()
    .from("readings")
    .select("id, kind, lang, status, price, currency, payment_id, paid_at, ai_status, created_at, name:input->>name, nameA:input->a->>name, nameB:input->b->>name", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(filter.page * PAGE_SIZE, filter.page * PAGE_SIZE + PAGE_SIZE - 1);
  if (filter.status) q = q.eq("status", filter.status);
  if (filter.kind) q = q.eq("kind", filter.kind);
  if (filter.lang) q = q.eq("lang", filter.lang);
  const { data, count, error } = await q;
  if (error) throw error;

  const ids = data.map((r) => r.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    const f = await db().from("followups").select("reading_id").in("reading_id", ids);
    if (f.error) throw f.error;
    for (const row of f.data) counts.set(row.reading_id, (counts.get(row.reading_id) ?? 0) + 1);
  }
  const items: ReadingListItem[] = data.map((r) => {
    const row = r as typeof r & { name: string | null; nameA: string | null; nameB: string | null };
    return {
      ...(r as unknown as ReadingListItem),
      name: row.name || (row.nameA || row.nameB ? `${row.nameA || "?"} × ${row.nameB || "?"}` : null),
      followups: counts.get(r.id) ?? 0,
    };
  });
  return { items, total: count ?? 0 };
}

export type PaymentRecord = { payment_id: string; amount: number; status: string; raw: Record<string, unknown> | null; created_at: string; followup_id: string | null };

export async function getReadingDetail(id: string) {
  const [reading, followups, payments] = await Promise.all([
    db().from("readings").select("*").eq("id", id).maybeSingle(),
    db().from("followups").select("*").eq("reading_id", id).order("created_at"),
    db().from("payments").select("payment_id, amount, status, raw, created_at, followup_id").eq("reading_id", id).order("created_at"),
  ]);
  if (reading.error) throw reading.error;
  if (followups.error) throw followups.error;
  if (payments.error) throw payments.error;
  if (!reading.data) return null;
  return {
    reading: reading.data as unknown as ReadingRow,
    followups: followups.data as FollowupRow[],
    payments: payments.data as PaymentRecord[],
  };
}

export async function recentLogins(limit = 30) {
  const { data, error } = await db().from("admin_login_attempts").select("ip, ok, reason, user_agent, created_at").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}
