import { PILLAR_EN } from "@/lib/en";
import type { Lang } from "@/lib/i18n";
import type { Element, SajuChart } from "@/lib/saju";

export const ELEMENT_TEXT: Record<Element, string> = {
  목: "text-wood",
  화: "text-fire",
  토: "text-earth",
  금: "text-metal",
  수: "text-water",
};

/** 명식을 한 줄(시·일·월·연)로 간단히 보여 준다. */
export function PillarRow({ chart, lang = "ko" }: { chart: SajuChart; lang?: Lang }) {
  return (
    <div className={`grid gap-1 text-center ${chart.pillars.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
      {chart.pillars.map((p) => (
        <div key={p.label}>
          <p className="mb-1.5 text-[11px] text-muted-soft">{lang === "en" ? PILLAR_EN[p.label] : p.label}</p>
          <p className={`bg-surface-2 py-2.5 font-[family-name:var(--font-hanja)] text-2xl font-bold ${ELEMENT_TEXT[p.ganElement]}`}>{p.gan}</p>
          <p className={`mt-1 bg-surface-2 py-2.5 font-[family-name:var(--font-hanja)] text-2xl font-bold ${ELEMENT_TEXT[p.zhiElement]}`}>{p.zhi}</p>
        </div>
      ))}
    </div>
  );
}
