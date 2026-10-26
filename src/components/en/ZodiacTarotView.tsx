import Image from "next/image";
import type { ZodiacTarotChart, ZodiacTarotInput } from "@/lib/zodiac";
import { SIGNS } from "@/lib/zodiac-signs";
import { Eyebrow, Panel } from "../ui";

function CardImage({ cardId, alt, reversed = false, className = "" }: { cardId: string; alt: string; reversed?: boolean; className?: string }) {
  return (
    <Image
      src={`/tarot/${cardId}.webp`}
      alt={alt}
      width={350}
      height={600}
      unoptimized
      className={`${className} ${reversed ? "rotate-180" : ""}`}
    />
  );
}

export function ZodiacTarotView({ input, chart }: { input: ZodiacTarotInput; chart: ZodiacTarotChart }) {
  const sign = SIGNS.find((s) => s.key === chart.sign)!;
  return (
    <div className="space-y-px">
      <Panel>
        <Eyebrow>ZODIAC TAROT</Eyebrow>
        <h1 className="mt-3 text-[28px] text-ink">
          {input.name ? `${input.name}'s ` : ""}
          {chart.topicLabel} reading
        </h1>
        {input.question && <p className="mt-2 text-[15px] text-muted">“{input.question}”</p>}

        <div className="mt-8 grid items-center gap-6 border-t border-line pt-6 sm:grid-cols-[auto_1fr]">
          <CardImage cardId={chart.birthCard.cardId} alt={`${chart.birthCard.name}, the card of ${sign.name}`} className="mx-auto w-28" />
          <div>
            <p className="text-5xl text-gold">{sign.symbol}</p>
            <p className="mt-2 text-2xl text-ink">{sign.name}</p>
            <p className="mt-1 text-xs text-muted">
              {sign.dates} · {sign.element} · {sign.modality} · ruled by {sign.ruler}
            </p>
            <p className="mt-3 text-[15px] leading-7 text-muted">
              Your sign&apos;s card is <span className="text-body">{chart.birthCard.name}</span>: {chart.birthCard.meaning.toLowerCase()}. It colors every
              card you draw today.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-soft">
              Korean zodiac: <span className="text-body">{chart.animal.name}</span>{" "}
              <span className="font-[family-name:var(--font-hanja)]">{chart.animal.ganZhi}</span> — {chart.animal.trait}
            </p>
          </div>
        </div>
      </Panel>

      <Panel>
        <Eyebrow>YOUR THREE CARDS</Eyebrow>
        <div className="mt-6 grid gap-px bg-line sm:grid-cols-3">
          {chart.cards.map((c, i) => (
            <div key={c.position} className="bg-surface-1 px-4 py-6 text-center">
              <p className="text-xs text-gold">
                0{i + 1} · {c.position}
              </p>
              <CardImage
                cardId={c.cardId}
                alt={`${c.name}${c.reversed ? ", reversed" : ""}`}
                reversed={c.reversed}
                className="mx-auto my-5 w-32 sm:w-full sm:max-w-36"
              />
              <p className="text-base text-ink">
                {c.name} <span className="text-xs text-muted">{c.reversed ? "reversed" : "upright"}</span>
              </p>
              <p className="mt-1.5 text-sm leading-6 text-muted">{c.meaning}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
