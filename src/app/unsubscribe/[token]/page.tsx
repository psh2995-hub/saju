import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";
import { UnsubscribeButton } from "./UnsubscribeButton";

export const metadata: Metadata = { title: "수신 거부", robots: { index: false } };

export default function UnsubscribePage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <PageHeader eyebrow="UNSUBSCRIBE" title="매일 운세 수신 거부">
        아래 버튼을 누르면 알림톡 발송이 중단되고 저장된 휴대전화 번호가 즉시 삭제됩니다.
      </PageHeader>
      <Suspense>
        <UnsubscribeButton />
      </Suspense>
    </div>
  );
}
