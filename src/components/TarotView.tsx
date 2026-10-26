import Image from "next/image";
import type { TarotChart, TarotInput } from "@/lib/tarot";

export function TarotView({ input, chart }: { input: TarotInput; chart: TarotChart }) {
  return (
    <section className="space-y-5 rounded-2xl border border-line bg-surface p-5">
      <div>
        <h2 className="font-serif text-xl font-bold">{chart.topicLabel} 리딩</h2>
        {input.question && <p className="mt-2 text-sm text-muted">“{input.question}”</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {chart.cards.map((c) => (
          <div key={c.position} className="rounded-xl border border-line bg-surface-2 p-4 text-center">
            <p className="text-xs text-gold">{c.position}</p>
            <Image
              src={`/tarot/${c.cardId}.webp`}
              alt={`${c.name} (${c.nameEn})${c.reversed ? " 역방향" : ""}`}
              width={350}
              height={600}
              unoptimized
              className={`mx-auto my-3 w-28 rounded-lg border border-gold/60 shadow-lg shadow-black/40 sm:w-full sm:max-w-36 ${c.reversed ? "rotate-180" : ""}`}
            />
            <p className="text-sm font-bold">
              {c.name} <span className="text-xs font-normal text-muted">{c.reversed ? "역방향" : "정방향"}</span>
            </p>
            <p className="mt-1 text-sm text-muted">{c.meaning}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
