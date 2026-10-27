import type { Lang } from "@/lib/i18n";
import { PageHeader } from "./ui";

export function LegalPage({
  title,
  effectiveDate,
  lang = "ko",
  children,
}: {
  title: string;
  effectiveDate: string;
  lang?: Lang;
  children: React.ReactNode;
}) {
  return (
    <article className="legal mx-auto max-w-3xl px-5 pt-14">
      <PageHeader eyebrow="POLICY" title={title}>
        {lang === "en" ? "Effective" : "시행일"}: {effectiveDate}
      </PageHeader>
      {children}
    </article>
  );
}
