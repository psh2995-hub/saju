import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import { requireAdmin } from "@/lib/admin/auth";
import { getReadingDetail, isMock, kstDateTime } from "@/lib/admin/data";
import { formatPrice, readingPath } from "@/lib/i18n";
import { siteUrl } from "@/lib/share";
import { aiStatusLabel, kindName, StatusBadge, tdClass, thClass } from "../../components";

export const metadata: Metadata = { title: "풀이 상세" };

export default function ReadingDetailPage(props: PageProps<"/admin/r/[id]">) {
  return (
    <Suspense fallback={<p className="animate-pulse text-muted">불러오는 중…</p>}>
      <Detail {...props} />
    </Suspense>
  );
}

const LABELS: Record<string, string> = {
  name: "이름",
  gender: "성별",
  calendar: "달력",
  leapMonth: "윤달",
  year: "년",
  month: "월",
  day: "일",
  hour: "시",
  minute: "분",
  timeZone: "시간대",
  placeId: "출생 도시",
  question: "질문",
  topic: "주제",
  a: "본인",
  b: "상대",
  lunar: "음력 입력",
};

const VALUES: Record<string, string> = { male: "남", female: "여", solar: "양력", lunar: "음력", true: "예", false: "아니오" };

/** 입력값을 "본인 · 이름: 홍길동"처럼 한 줄씩 펼친다. */
function flatten(value: unknown, path: string[] = []): [string, string][] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([k, v]) => flatten(v, [...path, LABELS[k] ?? k]));
  }
  return [[path.join(" · "), value === null || value === undefined || value === "" ? "—" : (VALUES[String(value)] ?? String(value))]];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface-1 p-6">
      <h2 className="text-lg text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

async function Detail({ params }: PageProps<"/admin/r/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const detail = await getReadingDetail(id);
  if (!detail) notFound();
  const { reading, followups, payments } = detail;
  const price = (n: number, currency: string) => formatPrice(n, "ko", currency === "USD" ? "USD" : "KRW");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">{kstDateTime(reading.created_at)} 생성</p>
        <h1 className="mt-1 text-2xl text-ink">
          {kindName(reading.kind)} {reading.lang === "en" && <span className="text-base text-muted">(영문)</span>}
        </h1>
        <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <StatusBadge status={reading.status} mock={isMock(reading.payment_id)} />
          <span>{price(reading.price, reading.currency)}</span>
          <span className="text-muted">결제 {kstDateTime(reading.paid_at)}</span>
          <span className="text-muted">AI {aiStatusLabel(reading.ai_status)}</span>
          <a href={`${siteUrl()}${readingPath(reading.id, reading.lang)}`} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-4 hover:text-gold">
            고객 화면 열기
          </a>
        </p>
      </div>

      <Section title="입력 정보">
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
          {flatten(reading.input).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted">{k}</dt>
              <dd className="break-all text-body">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="결제 기록">
        {payments.length === 0 ? (
          <p className="text-sm text-muted">{isMock(reading.payment_id) ? "테스트(가짜) 결제로 열린 풀이입니다." : "토스페이먼츠 결제 기록이 없습니다."}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr>
                  <th className={thClass}>대상</th>
                  <th className={thClass}>주문번호</th>
                  <th className={thClass}>상태</th>
                  <th className={thClass}>금액</th>
                  <th className={thClass}>수단</th>
                  <th className={thClass}>승인 시각</th>
                  <th className={thClass}>영수증</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const raw = p.raw ?? {};
                  const receipt = (raw.receipt as { url?: string } | null)?.url;
                  return (
                    <tr key={p.payment_id}>
                      <td className={tdClass}>{p.followup_id ? "추가 질문" : "풀이"}</td>
                      <td className={`${tdClass} font-mono text-xs`}>{p.payment_id}</td>
                      <td className={tdClass}>{p.status}</td>
                      <td className={tdClass}>{price(p.amount, String(raw.currency ?? "KRW"))}</td>
                      <td className={tdClass}>{String(raw.method ?? "—")}</td>
                      <td className={tdClass}>{kstDateTime((raw.approvedAt as string) ?? null)}</td>
                      <td className={tdClass}>
                        {receipt ? (
                          <a href={receipt} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-gold">
                            보기
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="AI 풀이">
        {reading.ai_result ? (
          <div className="reading">
            <ReactMarkdown>{reading.ai_result}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-muted">아직 작성된 풀이가 없습니다. ({aiStatusLabel(reading.ai_status)})</p>
        )}
      </Section>

      <Section title={`추가 질문 ${followups.length}건`}>
        {followups.length === 0 && <p className="text-sm text-muted">없습니다.</p>}
        <div className="space-y-8">
          {followups.map((f) => (
            <article key={f.id} className="border-t border-line pt-5 first:border-0 first:pt-0">
              <p className="flex flex-wrap gap-x-4 text-sm text-muted">
                <span>{kstDateTime(f.created_at)}</span>
                <StatusBadge status={f.status} mock={isMock(f.payment_id)} />
                <span>{price(f.price, f.currency)}</span>
                <span>AI {aiStatusLabel(f.ai_status)}</span>
              </p>
              <p className="mt-3 text-[15px] text-ink">Q. {f.question}</p>
              {f.ai_result && (
                <div className="reading mt-4">
                  <ReactMarkdown>{f.ai_result}</ReactMarkdown>
                </div>
              )}
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
