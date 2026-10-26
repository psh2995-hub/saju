"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { FollowupRow } from "@/lib/supabase";
import { Followups } from "./Followups";
import { Unlock, type UnlockTarget } from "./Unlock";

type Redirect = { paymentId: string; code: string | null; message: string | null; followupId: string | null } | null;

/** 결과 페이지의 결제·풀이 영역과, 풀이가 끝난 뒤 열리는 추가 질문 영역 */
export function ReadingActions(props: {
  readingId: string;
  productName: string;
  price: number;
  status: "unpaid" | "paid" | "refunded";
  result: string | null;
  followups: FollowupRow[];
  mockPayment: boolean;
  paymentRedirect: Redirect;
  description: React.ReactNode;
  lang?: Lang;
}) {
  const [done, setDone] = useState(props.status === "paid" && !!props.result);
  const target: UnlockTarget = { type: "reading", id: props.readingId, readingId: props.readingId };
  const redirect = props.paymentRedirect;
  return (
    <>
      <Unlock
        target={target}
        productName={props.productName}
        price={props.price}
        initialStatus={props.status}
        initialResult={props.result}
        mockPayment={props.mockPayment}
        paymentRedirect={redirect && !redirect.followupId ? redirect : null}
        description={props.description}
        onDone={() => setDone(true)}
        lang={props.lang}
      />
      {done && (
        <Followups
          readingId={props.readingId}
          initial={props.followups}
          mockPayment={props.mockPayment}
          paymentRedirect={redirect?.followupId ? { ...redirect, followupId: redirect.followupId } : null}
          lang={props.lang}
        />
      )}
    </>
  );
}
