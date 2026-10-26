import Image from "next/image";
import type { Lang } from "@/lib/i18n";
import type { TarotChart, TarotInput } from "@/lib/tarot";
import { Eyebrow, Panel } from "./ui";

const TEXT = {
  ko: { reading: (topic: string) => `${topic} 리딩`, upright: "정방향", reversed: "역방향" },
  en: { reading: (topic: string) => `${topic} reading`, upright: "upright", reversed: "reversed" },
};

export function TarotView({ input, chart, lang = "ko" }: { input: TarotInput; chart: TarotChart; lang?: Lang }) {
  const t = TEXT[lang];
  return (
    <Panel>
      <Eyebrow>TAROT READING</Eyebrow>
      <h1 className="mt-3 text-[28px] text-ink">{t.reading(chart.topicLabel)}</h1>
      {input.question && <p className="mt-2 text-[15px] text-muted">“{input.question}”</p>}
      <div className="mt-8 grid gap-px bg-line sm:grid-cols-3">
        {chart.cards.map((c, i) => (
          <div key={c.position} className="bg-surface-1 px-4 py-6 text-center">
            <p className="text-xs text-gold">
              0{i + 1} · {c.position}
            </p>
            <Image
              src={`/tarot/${c.cardId}.webp`}
              alt={`${c.name}${lang === "ko" ? ` (${c.nameEn})` : ""}${c.reversed ? ` ${t.reversed}` : ""}`}
              width={350}
              height={600}
              unoptimized
              className={`mx-auto my-5 w-32 sm:w-full sm:max-w-36 ${c.reversed ? "rotate-180" : ""}`}
            />
            <p className="text-base text-ink">
              {c.name} <span className="text-xs text-muted">{c.reversed ? t.reversed : t.upright}</span>
            </p>
            <p className="mt-1.5 text-sm leading-6 text-muted">{c.meaning}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
