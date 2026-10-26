import Image from "next/image";
import type { TarotChart, TarotInput } from "@/lib/tarot";
import { Eyebrow, Panel } from "./ui";

export function TarotView({ input, chart }: { input: TarotInput; chart: TarotChart }) {
  return (
    <Panel>
      <Eyebrow>TAROT READING</Eyebrow>
      <h1 className="mt-3 text-[28px] text-ink">{chart.topicLabel} 리딩</h1>
      {input.question && <p className="mt-2 text-[15px] text-muted">“{input.question}”</p>}
      <div className="mt-8 grid gap-px bg-line sm:grid-cols-3">
        {chart.cards.map((c, i) => (
          <div key={c.position} className="bg-surface-1 px-4 py-6 text-center">
            <p className="text-xs text-gold">
              0{i + 1} · {c.position}
            </p>
            <Image
              src={`/tarot/${c.cardId}.webp`}
              alt={`${c.name} (${c.nameEn})${c.reversed ? " 역방향" : ""}`}
              width={350}
              height={600}
              unoptimized
              className={`mx-auto my-5 w-32 sm:w-full sm:max-w-36 ${c.reversed ? "rotate-180" : ""}`}
            />
            <p className="text-base text-ink">
              {c.name} <span className="text-xs text-muted">{c.reversed ? "역방향" : "정방향"}</span>
            </p>
            <p className="mt-1.5 text-sm leading-6 text-muted">{c.meaning}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
