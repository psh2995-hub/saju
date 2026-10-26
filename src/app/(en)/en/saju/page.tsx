import type { Metadata } from "next";
import { EnBirthForm } from "@/components/en/forms";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Korean Birth Chart (Saju)",
  description: "Your Four Pillars of Destiny: your Korean birth sign, five elements and ten-year luck cycles.",
};

export default function EnSajuPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <PageHeader eyebrow="SAJU · FOUR PILLARS" title="Korean Birth Chart">
        Saju (사주, “four pillars”) is how Koreans have read destiny for centuries: the year, month, day and hour you were born, each written as
        two characters. See your Korean birth sign, your five elements and your ten-year luck cycles — free.
      </PageHeader>
      <EnBirthForm kind="saju" submitLabel="See my birth chart — free" />
    </div>
  );
}
