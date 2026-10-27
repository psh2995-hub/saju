import { kSign, romanize } from "@/lib/en";
import type { GunghapChart, GunghapInput } from "@/lib/gunghap";
import type { Lang } from "@/lib/i18n";
import { ILJU_SUMMARY } from "@/lib/ilju";
import type { SajuChart } from "@/lib/saju";
import { PillarRow } from "./PillarRow";
import { Eyebrow, Panel } from "./ui";

function Person({ label, chart, lang }: { label: string; chart: SajuChart; lang: Lang }) {
  const d = chart.pillars.find((p) => p.label === "일주")!;
  const y = chart.pillars.find((p) => p.label === "연주")!;
  return (
    <div className="bg-surface-1 p-5">
      <p className="text-sm text-ink">{label}</p>
      <p className="mt-1 text-xs text-muted">
        {lang === "en"
          ? `Born ${chart.solarDate} · ${kSign(y.gan + y.zhi, false)} year${chart.usedTime ? "" : " · birth time unknown"}`
          : `${chart.solarDate} · ${chart.zodiac}띠${chart.usedTime ? "" : " · 시간 모름"}`}
      </p>
      <div className="mt-4">
        <PillarRow chart={chart} lang={lang} />
      </div>
      <p className="mt-4 text-xs text-gold">
        {lang === "en" ? "Day pillar " : "일주 "}
        <span className="font-[family-name:var(--font-hanja)]">{d.gan}{d.zhi}</span>
        {lang === "en" ? ` · the ${kSign(d.gan + d.zhi)} (${romanize(d.gan + d.zhi)})` : `(${d.ganKo}${d.zhiKo}) — ${ILJU_SUMMARY[d.gan + d.zhi].title}`}
      </p>
    </div>
  );
}

export function GunghapView({ input, chart, lang = "ko" }: { input: GunghapInput; chart: GunghapChart; lang?: Lang }) {
  const en = lang === "en";
  const nameA = input.a.name || (en ? "You" : "나");
  const nameB = input.b.name || (en ? "Your partner" : "상대");
  return (
    <div className="space-y-px">
      <Panel>
        <Eyebrow>{en ? "K-COMPATIBILITY" : "GUNGHAP"}</Eyebrow>
        <h1 className="mt-3 text-[28px] text-ink">
          {nameA} <span className="text-gold">×</span> {nameB}
          {en ? "" : " 궁합"}
        </h1>
        {en && (
          <p className="mt-2 text-sm leading-6 text-muted">
            Korean compatibility (gunghap) reads two Four Pillars side by side: how your core elements feed or challenge each other, how your day
            branches meet, and how your zodiac animals get along.
          </p>
        )}
      </Panel>
      <div className="grid gap-px bg-canvas sm:grid-cols-2">
        <Person label={nameA} chart={chart.a} lang={lang} />
        <Person label={nameB} chart={chart.b} lang={lang} />
      </div>
      <Panel>
        <Eyebrow>KEY POINTS</Eyebrow>
        <h2 className="mt-3 text-xl text-ink">{en ? "What stands out between you" : "궁합 핵심 포인트"}</h2>
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
