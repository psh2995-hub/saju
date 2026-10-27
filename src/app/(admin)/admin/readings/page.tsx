import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { isMock, kstDateTime, listReadings, PAGE_SIZE } from "@/lib/admin/data";
import { formatPrice } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/products";
import { aiStatusLabel, kindName, StatusBadge, TableLink, tdClass, thClass } from "../components";

export const metadata: Metadata = { title: "풀이·결제 내역" };

export default function ReadingsPage(props: PageProps<"/admin/readings">) {
  return (
    <Suspense fallback={<p className="animate-pulse text-muted">불러오는 중…</p>}>
      <Readings {...props} />
    </Suspense>
  );
}

const selectClass = "h-10 border border-line-strong bg-canvas px-2 text-sm text-ink";

async function Readings({ searchParams }: PageProps<"/admin/readings">) {
  await requireAdmin();
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);
  const filter = {
    page: Math.max(0, Number(one(q.page) ?? 0) || 0),
    status: one(q.status),
    kind: one(q.kind),
    lang: one(q.lang),
  };
  const { items, total } = await listReadings(filter);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (page: number) =>
    `/admin/readings?${new URLSearchParams({ ...(filter.status && { status: filter.status }), ...(filter.kind && { kind: filter.kind }), ...(filter.lang && { lang: filter.lang }), page: String(page) })}`;

  return (
    <div>
      <h1 className="text-2xl text-ink">풀이·결제 내역</h1>
      <form method="get" className="mt-6 flex flex-wrap items-center gap-2">
        <select name="status" defaultValue={filter.status ?? ""} className={selectClass}>
          <option value="">결제 상태 전체</option>
          <option value="paid">결제</option>
          <option value="unpaid">미결제</option>
          <option value="refunded">환불</option>
        </select>
        <select name="kind" defaultValue={filter.kind ?? ""} className={selectClass}>
          <option value="">상품 전체</option>
          {Object.entries(PRODUCTS).map(([k, p]) => (
            <option key={k} value={k}>
              {p.name}
            </option>
          ))}
        </select>
        <select name="lang" defaultValue={filter.lang ?? ""} className={selectClass}>
          <option value="">언어 전체</option>
          <option value="ko">한국어</option>
          <option value="en">영문</option>
        </select>
        <button className="h-10 border border-ink/50 px-4 text-sm text-ink hover:bg-ink hover:text-black">보기</button>
        <span className="ml-2 text-sm text-muted">{total}건</span>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr>
              <th className={thClass}>만든 시각</th>
              <th className={thClass}>상품</th>
              <th className={thClass}>이름</th>
              <th className={thClass}>결제</th>
              <th className={thClass}>금액</th>
              <th className={thClass}>결제 시각</th>
              <th className={thClass}>AI 풀이</th>
              <th className={thClass}>추가 질문</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td className={tdClass}>
                  <TableLink href={`/admin/r/${r.id}`}>{kstDateTime(r.created_at)}</TableLink>
                </td>
                <td className={tdClass}>
                  {kindName(r.kind)}
                  {r.lang === "en" && <span className="ml-1 text-xs text-muted">EN</span>}
                </td>
                <td className={tdClass}>{r.name || "—"}</td>
                <td className={tdClass}>
                  <StatusBadge status={r.status} mock={isMock(r.payment_id)} />
                </td>
                <td className={tdClass}>{formatPrice(r.price, "ko", r.currency)}</td>
                <td className={tdClass}>{kstDateTime(r.paid_at)}</td>
                <td className={tdClass}>{aiStatusLabel(r.ai_status)}</td>
                <td className={tdClass}>{r.followups || "—"}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className={`${tdClass} py-10 text-center text-muted`}>
                  내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-6 flex items-center gap-4 text-sm">
          {filter.page > 0 && <TableLink href={pageHref(filter.page - 1)}>이전</TableLink>}
          <span className="text-muted">
            {filter.page + 1} / {pages}
          </span>
          {filter.page + 1 < pages && <TableLink href={pageHref(filter.page + 1)}>다음</TableLink>}
        </div>
      )}
    </div>
  );
}
