import Link from "next/link";
import { formatPrice } from "@/lib/i18n";
import { PRODUCTS, type ReadingKind } from "@/lib/products";

export const kindName = (kind: ReadingKind | "followup") => (kind === "followup" ? "추가 질문" : PRODUCTS[kind].name);

/** 원화와 달러 매출을 함께 표시한다(달러는 센트). */
export function Money({ krw, usd }: { krw: number; usd: number }) {
  return (
    <>
      {formatPrice(krw, "ko", "KRW")}
      {usd > 0 && <span className="text-muted"> + {formatPrice(usd, "en", "USD")}</span>}
    </>
  );
}

const STATUS: Record<string, [string, string]> = {
  paid: ["결제", "text-gold"],
  unpaid: ["미결제", "text-muted"],
  refunded: ["환불", "text-error"],
};

export function StatusBadge({ status, mock }: { status: string; mock?: boolean }) {
  const [label, color] = STATUS[status] ?? [status, "text-muted"];
  return (
    <span className={color}>
      {label}
      {mock && status !== "unpaid" && <span className="ml-1 text-xs text-muted">(테스트)</span>}
    </span>
  );
}

const AI_STATUS: Record<string, string> = { none: "—", generating: "작성 중", done: "완료", failed: "실패" };
export const aiStatusLabel = (s: string) => AI_STATUS[s] ?? s;

export function TableLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} prefetch={false} className="text-ink underline decoration-line-strong underline-offset-4 hover:text-gold">
      {children}
    </Link>
  );
}

export const thClass = "border-b border-line-strong px-3 py-2 text-left text-xs font-normal tracking-[0.06em] text-muted";
export const tdClass = "border-b border-line px-3 py-2.5 align-top";
