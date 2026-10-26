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
            <div
              className={`mx-auto my-3 flex aspect-[2/3] w-24 flex-col items-center justify-center rounded-lg border border-gold/60 bg-background p-2 ${c.reversed ? "rotate-180" : ""}`}
            >
              <p className="font-serif text-sm font-bold text-gold-strong">{c.name}</p>
              <p className="mt-1 text-[10px] text-muted">{c.nameEn}</p>
            </div>
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
