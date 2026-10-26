import type { GunghapChart, GunghapInput } from "@/lib/gunghap";
import { ILJU_SUMMARY } from "@/lib/ilju";
import type { SajuChart } from "@/lib/saju";
import { PillarRow } from "./PillarRow";
import { Eyebrow, Panel } from "./ui";

function Person({ label, chart }: { label: string; chart: SajuChart }) {
  const d = chart.pillars.find((p) => p.label === "일주")!;
  return (
    <div className="bg-surface-1 p-5">
      <p className="text-sm text-ink">{label}</p>
      <p className="mt-1 text-xs text-muted">
        {chart.solarDate} · {chart.zodiac}띠{chart.usedTime ? "" : " · 시간 모름"}
      </p>
      <div className="mt-4">
        <PillarRow chart={chart} />
      </div>
      <p className="mt-4 text-xs text-gold">
        일주 <span className="font-[family-name:var(--font-hanja)]">{d.gan}{d.zhi}</span>({d.ganKo}{d.zhiKo}) — {ILJU_SUMMARY[d.gan + d.zhi].title}
      </p>
    </div>
  );
}

export function GunghapView({ input, chart }: { input: GunghapInput; chart: GunghapChart }) {
  const nameA = input.a.name || "나";
  const nameB = input.b.name || "상대";
  return (
    <div className="space-y-px">
      <Panel>
        <Eyebrow>GUNGHAP</Eyebrow>
        <h1 className="mt-3 text-[28px] text-ink">
          {nameA} <span className="text-gold">×</span> {nameB} 궁합
        </h1>
      </Panel>
      <div className="grid gap-px bg-canvas sm:grid-cols-2">
        <Person label={nameA} chart={chart.a} />
        <Person label={nameB} chart={chart.b} />
      </div>
      <Panel>
        <Eyebrow>KEY POINTS</Eyebrow>
        <h2 className="mt-3 text-xl text-ink">궁합 핵심 포인트</h2>
        <ul className="mt-5 space-y-5">
          {chart.points.map((p) => (
            <li key={p.title} className="flex gap-3">
              <span className={`mt-1.5 size-2 shrink-0 ${p.tone === "good" ? "bg-gold" : p.tone === "care" ? "border border-gold" : "bg-muted"}`} />
              <div>
                <p className="text-[15px] text-ink">{p.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
