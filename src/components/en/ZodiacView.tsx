import type { ZodiacChart, ZodiacInput } from "@/lib/zodiac";
import { POINTS, signByKey } from "@/lib/zodiac-signs";
import { Eyebrow, Panel } from "../ui";

const ELEMENT_COLOR = { Fire: "text-fire", Earth: "text-earth", Air: "text-metal", Water: "text-water" } as const;
const ELEMENT_BG = { Fire: "bg-fire", Earth: "bg-earth", Air: "bg-metal", Water: "bg-water" } as const;

export function ZodiacView({ input, chart }: { input: ZodiacInput; chart: ZodiacChart }) {
  const sun = signByKey(chart.placements[0].sign);
  const big = chart.placements.filter((p) => p.point === "sun" || p.point === "moon" || p.point === "rising");
  const personal = chart.placements.filter((p) => p.point === "mercury" || p.point === "venus" || p.point === "mars");
  const total = Object.values(chart.elements).reduce((a, b) => a + b, 0);
  const born = new Date(Date.UTC(input.year, input.month - 1, input.day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <div className="space-y-px">
      <Panel>
        <Eyebrow>ZODIAC · BIRTH CHART</Eyebrow>
        <h1 className="mt-3 text-[28px] text-ink">{input.name ? `${input.name}'s` : "Your"} zodiac</h1>
        <p className="mt-2 text-xs leading-5 text-muted">
          Born {born}
          {input.hour !== null ? ` · ${input.hour}:${String(input.minute ?? 0).padStart(2, "0")}` : " · birth time unknown"}
          {chart.place ? ` · ${chart.place}` : ""}
        </p>

        <div className="mt-8 flex items-center gap-5">
          <p className="text-6xl text-gold">{sun.symbol}</p>
          <div>
            <p className="text-2xl text-ink">{sun.name}</p>
            <p className="mt-1 text-xs text-muted">
              {sun.dates} · {sun.element} · {sun.modality} · ruled by {sun.ruler}
            </p>
            <p className="mt-2 text-sm text-body">{sun.keywords}</p>
          </div>
        </div>

        <div className={`mt-8 grid gap-px bg-line ${big.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {big.map((p) => {
            const s = signByKey(p.sign);
            return (
              <div key={p.point} className="bg-surface-2 px-3 py-5 text-center">
                <p className="text-xs text-gold">
                  {POINTS[p.point].name}
                  {p.point === "moon" && chart.moonUncertain ? "*" : ""}
                </p>
                <p className="mt-2 text-3xl text-ink">{s.symbol}</p>
                <p className="mt-1 text-sm text-ink">{s.name}</p>
                <p className="mt-1 text-[11px] leading-4 text-muted-soft">{POINTS[p.point].meaning}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-soft">
          {big.length < 3 && "Add your birth time and city to reveal your Rising sign. "}
          {chart.moonUncertain && "*The Moon changed signs on your birthday, so your Moon sign depends on your birth time."}
        </p>
      </Panel>

      <Panel>
        <Eyebrow>PERSONAL PLANETS</Eyebrow>
        <div className="mt-5 grid gap-px bg-line sm:grid-cols-3">
          {personal.map((p) => {
            const s = signByKey(p.sign);
            return (
              <div key={p.point} className="flex items-center gap-4 bg-surface-1 py-4 sm:block sm:px-4 sm:text-center">
                <p className="w-16 text-xs text-gold sm:w-auto">{POINTS[p.point].name}</p>
                <p className="text-2xl text-ink sm:mt-2">{s.symbol}</p>
                <div>
                  <p className="text-sm text-ink sm:mt-1">{s.name}</p>
                  <p className="text-[11px] text-muted-soft">{POINTS[p.point].meaning}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <Eyebrow>ELEMENTS</Eyebrow>
        <h2 className="mt-3 mb-5 text-xl text-ink">Your element balance</h2>
        <div className="space-y-3">
          {(Object.keys(chart.elements) as (keyof ZodiacChart["elements"])[]).map((el) => (
            <div key={el} className="flex items-center gap-3 text-sm">
              <span className={`w-14 ${ELEMENT_COLOR[el]}`}>{el}</span>
              <div className="h-1.5 flex-1 bg-surface-3">
                <div className={`h-full ${ELEMENT_BG[el]}`} style={{ width: `${(chart.elements[el] / total) * 100}%` }} />
              </div>
              <span className="w-6 text-right text-muted">{chart.elements[el]}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-muted-soft">
          Korean zodiac twist: you were born in a year of the <span className="text-body">{chart.animal.name}</span>{" "}
          <span className="font-[family-name:var(--font-hanja)]">{chart.animal.ganZhi}</span>. {chart.animal.trait}
        </p>
      </Panel>
    </div>
  );
}
