import type { Metadata } from "next";
import { ZodiacTarotForm } from "@/components/en/forms";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Zodiac Tarot",
  description: "Your sun sign and its tarot card, plus three cards drawn for your question — with a Korean zodiac twist.",
};

export default function ZodiacTarotPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <PageHeader eyebrow="ZODIAC TAROT" title="Zodiac Tarot">
        Every sign has its own tarot card. Tell us your birthday, then pick three cards from the shuffled deck. Your sign, its card and your Korean
        zodiac animal are free to see.
      </PageHeader>
      <ZodiacTarotForm />
    </div>
  );
}
