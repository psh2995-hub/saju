import type { Metadata } from "next";
import { ZodiacForm } from "@/components/en/forms";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Zodiac Reading",
  description: "Your Sun, Moon and Rising signs, your personal planets and element balance — with a Korean zodiac twist.",
};

export default function ZodiacPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <PageHeader eyebrow="ZODIAC · BIRTH CHART" title="Your zodiac, beyond your sun sign">
        Your sun sign is only the start. Add your birth time and city to see your Moon and Rising signs, your Venus and Mars, and your element
        balance — free. We calculate real planet positions for the moment you were born.
      </PageHeader>
      <ZodiacForm />
    </div>
  );
}
