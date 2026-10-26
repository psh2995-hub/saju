import type { Metadata } from "next";
import { TarotForm } from "@/components/en/forms";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Tarot Reading",
  description: "Pick three cards from a shuffled 78-card Rider-Waite deck and get a reading for your question.",
};

export default function EnTarotPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <PageHeader eyebrow="TAROT" title="Tarot Reading">
        All 78 cards are shuffled and laid out face down. Hold your question in mind and pick three. The card meanings are free.
      </PageHeader>
      <TarotForm />
    </div>
  );
}
