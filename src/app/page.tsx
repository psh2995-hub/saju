import Link from "next/link";
import { formatWon, PRODUCTS } from "@/lib/products";
import { SITE_NAME } from "@/lib/site";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="pt-6 text-center">
        <p className="text-sm tracking-[0.3em] text-gold">四柱 · TAROT</p>
        <h1 className="mt-4 font-serif text-3xl leading-snug font-bold sm:text-4xl">
          타고난 결을 알면
          <br />
          오늘의 선택이 가벼워집니다
        </h1>
        <p className="mt-4 text-muted">
          {SITE_NAME}는 정통 만세력으로 사주 명식을 세우고, 당신만을 위한 풀이를 정성껏 들려드립니다.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/saju" className="group rounded-2xl border border-line bg-surface p-6 transition hover:border-gold/60">
          <p className="font-serif text-2xl font-bold text-gold">사주 풀이</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            생년월일시로 사주팔자와 오행, 대운을 무료로 확인하고 성격·재물·직업·연애·건강·올해와 내년 운세까지 정밀
            풀이를 받아보세요.
          </p>
          <p className="mt-5 text-sm">
            명식 무료 · 정밀 풀이 <span className="font-bold text-gold-strong">{formatWon(PRODUCTS.saju.price)}</span>
          </p>
        </Link>
        <Link href="/tarot" className="group rounded-2xl border border-line bg-surface p-6 transition hover:border-gold/60">
          <p className="font-serif text-2xl font-bold text-gold">타로 리딩</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            지금 마음에 걸린 질문을 떠올리며 세 장의 카드를 뽑아보세요. 카드의 의미는 무료, 질문에 맞춘 심층 해석은
            유료입니다.
          </p>
          <p className="mt-5 text-sm">
            카드 의미 무료 · 심층 해석 <span className="font-bold text-gold-strong">{formatWon(PRODUCTS.tarot.price)}</span>
          </p>
        </Link>
      </section>

      <section className="rounded-2xl border border-line/60 p-6 text-sm leading-7 text-muted">
        <p className="mb-2 font-bold text-foreground">이용 안내</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>회원가입 없이 이용할 수 있습니다. 풀이 결과 페이지 주소를 저장해 두면 언제든 다시 볼 수 있습니다.</li>
          <li>유료 풀이는 결제 후 AI가 즉시 작성하며, 약 1~3분 정도 걸립니다.</li>
          <li>풀이는 오락·참고용 콘텐츠이며 중요한 결정은 전문가와 상의하세요.</li>
        </ul>
      </section>
    </div>
  );
}
