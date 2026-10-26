import { PageHeader } from "./ui";

export function LegalPage({ title, effectiveDate, children }: { title: string; effectiveDate: string; children: React.ReactNode }) {
  return (
    <article className="legal mx-auto max-w-3xl px-5 pt-14">
      <PageHeader eyebrow="POLICY" title={title}>
        시행일: {effectiveDate}
      </PageHeader>
      {children}
    </article>
  );
}
