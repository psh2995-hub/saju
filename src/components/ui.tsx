export const inputClass =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-foreground outline-none focus:border-gold/70 disabled:opacity-40";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-sm text-muted">{label}</p>
      {children}
    </div>
  );
}

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
    <div className="flex rounded-lg border border-line bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-md py-2 text-sm transition ${value === o.value ? "bg-gold font-bold text-background" : "text-muted"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl bg-gold py-3.5 font-bold text-background transition hover:bg-gold-strong disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}
