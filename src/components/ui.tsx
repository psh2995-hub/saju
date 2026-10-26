export const inputClass =
  "h-12 w-full border border-line-strong bg-canvas px-3.5 text-ink outline-none transition focus:border-gold disabled:opacity-40";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs tracking-[0.08em] text-muted">{label}</p>
      {children}
    </div>
  );
}

/** 선택지. 선택된 항목만 흰 면으로 뒤집힌다(금색은 주요 버튼 전용). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex border border-line-strong">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`h-11 flex-1 text-sm transition ${value === o.value ? "bg-ink font-bold text-surface-2" : "text-muted hover:text-ink"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** 금색 주요 버튼. 페이지마다 하나의 주요 행동에만 쓴다. */
export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`h-14 w-full bg-gold text-base text-black transition hover:bg-gold-dark hover:text-ink disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-muted-soft ${props.className ?? ""}`}
    />
  );
}

/** 테두리만 있는 보조 버튼 */
export const ghostButtonClass =
  "inline-flex h-14 items-center justify-center border border-ink/50 px-6 text-sm tracking-[0.04em] text-ink transition hover:border-ink hover:bg-ink hover:text-black";

/** 사이트 심볼: 육각형 안에 해가 지나는 길(호)과 해. */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 1.8 21 7v10l-9 5.2L3 17V7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.5 16.5c1.6-5.2 9.4-5.2 11 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="10.2" r="1.9" fill="currentColor" />
    </svg>
  );
}

/** 섹션 머리말(작은 라벨) */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs tracking-[0.2em] text-gold">{children}</p>;
}

/** 섹션 카드: 캔버스보다 한 단계 밝은 면, 각진 모서리 */
export function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`bg-surface-1 p-6 sm:p-8 ${className}`}>{children}</section>;
}

/** 하위 페이지 머리말 */
export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-10">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-4 text-[34px] leading-tight text-ink sm:text-[40px]">{title}</h1>
      {children && <p className="mt-4 text-[15px] leading-7 text-muted">{children}</p>}
    </div>
  );
}
