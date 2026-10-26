"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { PrimaryButton } from "@/components/ui";

// 메신저 링크 미리보기가 GET만으로 수신 거부를 일으키지 않도록 버튼을 눌러야 처리한다.
export function UnsubscribeButton() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  if (state === "done") return <p className="text-[15px] text-ink">수신 거부되었습니다. 그동안 이용해 주셔서 감사합니다.</p>;
  return (
    <>
      <PrimaryButton
        disabled={state === "busy"}
        onClick={async () => {
          setState("busy");
          const res = await fetch("/api/daily/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
          setState(res.ok ? "done" : "error");
        }}
      >
        수신 거부하기
      </PrimaryButton>
      {state === "error" && <p className="mt-3 text-sm text-error">처리하지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}
    </>
  );
}
