import { Suspense } from "react";
import { adminConfig, requireAdmin } from "@/lib/admin/auth";
import { getSummary, isMock, kstDateTime, listReadings } from "@/lib/admin/data";
import { formatPrice } from "@/lib/i18n";
import { aiStatusLabel, kindName, Money, StatusBadge, TableLink, tdClass, thClass } from "./components";

export default function AdminHome() {
  return (
    <Suspense fallback={<p className="animate-pulse text-muted">불러오는 중…</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  await requireAdmin();
  const [summary, recent] = await Promise.all([getSummary(), listReadings({ page: 0 })]);
  const maxDaily = Math.max(1, ...summary.daily.map((d) => d.krw));

  return (
    <div className="space-y-12">
      {!adminConfig().totpSecret && (
        <p className="border border-error/40 bg-surface-2 p-4 text-sm text-ink">
          2단계 인증(OTP)이 아직 꺼져 있습니다. <TableLink href="/admin/security">보안 설정</TableLink>에서 켜 주세요.
        </p>
      )}

      <section>
        <h1 className="text-2xl text-ink">매출</h1>
        <p className="mt-2 text-sm text-muted">
          결제 완료 기준(환불·테스트 결제 제외), 한국 시간. 환불 {summary.refunds}건 · 테스트(가짜) 결제 {summary.mock}건 · 만들어진 풀이 {summary.readings}건
        </p>
        <div className="mt-6 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          {summary.periods.map((p) => (
            <div key={p.label} className="bg-surface-1 p-5">
              <p className="text-xs text-muted">{p.label}</p>
              <p className="mt-2 text-xl text-ink">
                <Money krw={p.krw} usd={p.usd} />
              </p>
              <p className="mt-1 text-sm text-muted">{p.count}건</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-lg text-ink">상품별 (전체)</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr>
                <th className={thClass}>상품</th>
                <th className={thClass}>건수</th>
                <th className={thClass}>매출</th>
              </tr>
            </thead>
            <tbody>
              {summary.byKind.map((k) => (
                <tr key={k.kind}>
                  <td className={tdClass}>{kindName(k.kind)}</td>
                  <td className={tdClass}>{k.count}</td>
                  <td className={tdClass}>
                    <Money krw={k.krw} usd={k.usd} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="text-lg text-ink">최근 14일</h2>
          <ul className="mt-4 space-y-1.5 text-sm">
            {summary.daily.map((d) => (
              <li key={d.date} className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-muted">{d.date.slice(5)}</span>
                <span className="h-3 bg-gold" style={{ width: `${(d.krw / maxDaily) * 60}%` }} />
                <span className="shrink-0 text-body">
                  {d.count ? (
                    <>
                      <Money krw={d.krw} usd={d.usd} /> · {d.count}건
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg text-ink">최근 풀이</h2>
          <TableLink href="/admin/readings">전체 보기</TableLink>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr>
                <th className={thClass}>만든 시각</th>
                <th className={thClass}>상품</th>
                <th className={thClass}>이름</th>
                <th className={thClass}>결제</th>
                <th className={thClass}>금액</th>
                <th className={thClass}>AI 풀이</th>
                <th className={thClass}>추가 질문</th>
              </tr>
            </thead>
            <tbody>
              {recent.items.slice(0, 15).map((r) => (
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
                  <td className={tdClass}>{aiStatusLabel(r.ai_status)}</td>
                  <td className={tdClass}>{r.followups || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
