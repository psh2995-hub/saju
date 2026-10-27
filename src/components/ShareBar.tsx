"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const TEXT = {
  ko: { share: "결과 공유하기", copied: "링크를 복사했어요", save: "이미지 저장" },
  en: { share: "Share my result", copied: "Link copied", save: "Save image" },
};

/** 무료 요약을 공유 페이지(/s/{shareId}, 영문은 /en/s/{shareId}) 링크와 이미지로 내보낸다. 결과 페이지 주소(유료 풀이 열람용)는 공유하지 않는다. */
export function ShareBar({ shareId, title, lang = "ko" }: { shareId: string; title: string; lang?: Lang }) {
  const t = TEXT[lang];
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${lang === "en" ? "/en" : ""}/s/${shareId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // 사용자가 공유 창을 닫은 경우 등은 무시하고 복사로 넘어가지 않는다.
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const button = "flex h-12 flex-1 items-center justify-center gap-2 border border-line-strong text-sm text-body transition hover:border-ink hover:text-ink";
  return (
    <div className="flex gap-px bg-surface-1 p-4 sm:px-8">
      <button type="button" onClick={share} className={button}>
        {copied ? t.copied : t.share}
      </button>
      <a href={`/api/share-image/${shareId}?download=1`} download className={`${button} ml-2`}>
        {t.save}
      </a>
    </div>
  );
}
