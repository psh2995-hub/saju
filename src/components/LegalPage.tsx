export function LegalPage({ title, effectiveDate, children }: { title: string; effectiveDate: string; children: React.ReactNode }) {
  return (
    <article className="legal">
      <h1 className="font-serif text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted">시행일: {effectiveDate}</p>
      {children}
    </article>
  );
}
