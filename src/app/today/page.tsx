import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Eyebrow, PageHeader, Panel } from "@/components/ui";
import { DAY_GANS, getDailyFortune, isDayGan, todayGanZhi } from "@/lib/daily";
import { messagingConfigured } from "@/lib/kakao";
import { DAY_MASTER_SUMMARY, GAN_KO, koGanZhi } from "@/lib/saju";
import { SubscribeForm } from "./SubscribeForm";

export const metadata: Metadata = { title: "오늘의 운세", description: "오늘의 일진과 내 일간으로 보는 오늘의 운세" };

export default function TodayPage(props: PageProps<"/today">) {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <Suspense fallback={<PageHeader eyebrow="TODAY" title="오늘의 운세" />}>
        <Today {...props} />
      </Suspense>
    </div>
  );
}

async function Today({ searchParams }: PageProps<"/today">) {
  const { g } = await searchParams;
  // 오늘 날짜는 요청 시점 기준이다.
  await connection();
  const gan = isDayGan(g) ? g : null;
  const t = todayGanZhi();

  return (
    <>
      <PageHeader eyebrow="TODAY" title="오늘의 운세">
        {t.m}월 {t.d}일 오늘의 일진은{" "}
        <span className="font-[family-name:var(--font-hanja)] text-ink">{t.ganZhi}</span>({koGanZhi(t.ganZhi)})입니다. 내 일간을 고르면 오늘의 흐름을
        알려 드려요.
      </PageHeader>

      <div className="space-y-px">
        <Panel>
          <p className="mb-3 text-xs tracking-[0.08em] text-muted">내 일간 선택</p>
          <div className="grid grid-cols-5 gap-px bg-line-strong">
            {DAY_GANS.map((d) => (
              <Link
                key={d}
                href={`/today?g=${encodeURIComponent(d)}`}
                className={`py-3 text-center transition ${d === gan ? "bg-ink text-black" : "bg-canvas text-body hover:text-ink"}`}
              >
                <span className="block font-[family-name:var(--font-hanja)] text-xl">{d}</span>
                <span className="text-xs">{GAN_KO[d]}</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-soft">
            내 일간을 모르면{" "}
            <Link href="/saju" className="text-body underline hover:text-gold">
              무료 사주
            </Link>
            에서 확인할 수 있어요. 사주 결과의 &lsquo;일주&rsquo; 첫 글자가 일간입니다.
          </p>
        </Panel>

        {gan && (
          <Suspense fallback={<Panel><p className="animate-pulse py-8 text-center text-muted">오늘의 운세를 펼치는 중…</p></Panel>}>
            <Fortune gan={gan} />
          </Suspense>
        )}

        {gan && (
          <Panel>
            <Eyebrow>KAKAO</Eyebrow>
            <h2 className="mt-3 text-xl text-ink">매일 아침 카카오톡으로 받기</h2>
            <p className="mt-2 mb-6 text-sm leading-6 text-muted">
              {gan}({GAN_KO[gan]}) 일간의 오늘의 운세를 매일 아침 8시에 알림톡으로 보내 드려요. 무료이며 언제든 수신 거부할 수 있습니다.
            </p>
            {messagingConfigured() ? <SubscribeForm dayGan={gan} /> : <p className="text-sm text-muted-soft">알림톡 구독은 준비 중입니다.</p>}
          </Panel>
        )}
      </div>
    </>
  );
}

async function Fortune({ gan }: { gan: string }) {
  let f;
  try {
    f = await getDailyFortune(gan);
  } catch (e) {
    console.error("daily fortune failed", gan, e);
    return (
      <Panel>
        <p className="py-6 text-center text-sm text-muted">오늘의 운세를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
      </Panel>
    );
  }
  return (
    <Panel className="border-t-2 border-gold">
      <Eyebrow>
        {gan}({GAN_KO[gan]}) · {DAY_MASTER_SUMMARY[gan].title}
      </Eyebrow>
      <h2 className="mt-3 text-2xl text-ink">{f.summary}</h2>
      <p className="mt-2 text-xs text-muted-soft">
        오늘 일진의 기운: 천간 {f.ganTenGod} · 지지 {f.zhiTenGod}
      </p>
      <p className="mt-5 text-[15px] leading-8 text-body">{f.body}</p>
      <p className="mt-5 border-t border-line pt-4 text-sm text-gold">오늘의 실천 · {f.tip}</p>
    </Panel>
  );
}
