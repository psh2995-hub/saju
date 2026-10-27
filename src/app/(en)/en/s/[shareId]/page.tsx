import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { PillarRow } from "@/components/PillarRow";
import { Eyebrow, ghostButtonClass } from "@/components/ui";
import { SITE_NAME_EN } from "@/lib/i18n";
import type { SajuChart } from "@/lib/saju";
import { shareSummary, type SharePillar } from "@/lib/share";
import { getReadingByShareId } from "@/lib/supabase";

export async function generateMetadata({ params }: PageProps<"/en/s/[shareId]">): Promise<Metadata> {
  const { shareId } = await params;
  const reading = await getReadingByShareId(shareId);
  if (!reading) return { title: "Shared result" };
  const s = shareSummary(reading);
  return {
    title: `${s.eyebrow} — ${s.headline}`,
    description: s.body,
    openGraph: { title: `${s.eyebrow} — ${s.headline}`, description: s.body, images: [`/api/share-image/${shareId}?format=og`] },
    twitter: { card: "summary_large_image" },
  };
}

export default function EnSharePage(props: PageProps<"/en/s/[shareId]">) {
  return (
    <Suspense fallback={<p className="animate-pulse py-24 text-center text-muted">Loading…</p>}>
      <Shared {...props} />
    </Suspense>
  );
}

// PillarRow는 SajuChart를 받으므로, 공유 요약의 기둥 목록을 그 모양으로 감싼다. 기둥 이름은 이미 영어다.
const asChart = (pillars: SharePillar[]) => ({ pillars }) as unknown as SajuChart;

async function Shared({ params }: PageProps<"/en/s/[shareId]">) {
  const { shareId } = await params;
  const reading = await getReadingByShareId(shareId);
  if (!reading) notFound();
  if (reading.lang !== "en") redirect(`/s/${shareId}`);
  const s = shareSummary(reading);

  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <section className="bg-surface-1 p-6 sm:p-10">
        <Eyebrow>{s.eyebrow}</Eyebrow>
        {s.hanja && <p className="mt-4 font-[family-name:var(--font-hanja)] text-5xl font-bold text-ink">{s.hanja}</p>}
        <h1 className="mt-4 text-[26px] leading-snug text-ink">{s.headline}</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted">{s.body}</p>
        {s.pillars && (
          <div className="mt-8 space-y-4">
            <PillarRow chart={asChart(s.pillars)} />
            {s.pillarsB && <PillarRow chart={asChart(s.pillarsB)} />}
          </div>
        )}
        {s.cards && (
          <div className="mt-8 grid grid-cols-3 gap-px bg-line">
            {s.cards.map((c) => (
              <div key={c.position} className="bg-surface-1 py-4 text-center">
                <p className="text-xs text-gold">{c.position}</p>
                <p className="mt-2 text-sm text-ink">{c.name}</p>
                <p className="text-xs text-muted">{c.reversed ? "reversed" : "upright"}</p>
              </div>
            ))}
          </div>
        )}
      </section>
      <div className="mt-px flex flex-col gap-3 bg-surface-1 p-6 sm:flex-row sm:p-8">
        <Link href={s.cta.href} className="inline-flex h-14 flex-1 items-center justify-center bg-gold text-base text-black transition hover:bg-gold-dark hover:text-ink">
          {s.cta.label}
        </Link>
        <Link href="/en" className={`${ghostButtonClass} flex-1`}>
          Explore {SITE_NAME_EN}
        </Link>
      </div>
      <p className="mt-4 text-center text-xs text-muted-soft">A free result shared by a friend.</p>
    </div>
  );
}
