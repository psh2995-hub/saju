// 한국어(기본)와 해외 방문자용 영어. 클라이언트 컴포넌트에서도 쓰므로 서버 전용 모듈을 import하지 않는다.
export type Lang = "ko" | "en";

export const isLang = (v: unknown): v is Lang => v === "ko" || v === "en";

/** 결제 통화. 금액은 KRW는 원, USD는 센트 단위로 저장한다(포트원 totalAmount 규칙과 같다). */
export type Currency = "KRW" | "USD";

/** 토스페이먼츠 달러 채널(해외카드)이 설정되면 영문 페이지 결제를 달러로 받는다. */
export const USD_CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_USD;
export const usdPaymentsEnabled = () => !!USD_CHANNEL_KEY;

/** 언어 선택을 기억하는 쿠키. proxy.ts가 첫 화면(/)에서 읽는다. */
export const LANG_COOKIE = "lang";

/** 해외 페이지의 상호. 환경 변수로 덮어쓸 수 있다. */
export const SITE_NAME_EN = process.env.NEXT_PUBLIC_SITE_NAME_EN || "Unmyeong Dabang";

export function readingPath(id: string, lang: Lang) {
  return lang === "en" ? `/en/r/${id}` : `/r/${id}`;
}

/**
 * 영문은 달러로 보여 준다. 원화 결제라면 가격대를 그대로 달러 가격대로 옮긴다
 * (2,900원 → $2, 3,900원 → $3, 4,900원 → $4, 5,900원 → $5). products.ts의 달러 가격과 같은 규칙이다.
 */
export function formatPrice(n: number, lang: Lang, currency: Currency = "KRW") {
  if (currency === "USD") return `$${Number.isInteger(n / 100) ? n / 100 : (n / 100).toFixed(2)}`;
  if (lang === "ko") return `${n.toLocaleString("ko-KR")}원`;
  return `$${Math.floor(n / 1000)}`;
}

/** 결제·풀이·추가 질문 영역(클라이언트 컴포넌트)의 문구 */
export const UI_TEXT = {
  ko: {
    fallbackError: "잠시 후 다시 시도해 주세요.",
    paymentCancelled: "결제가 취소되었습니다.",
    paymentIncomplete: "결제가 완료되지 않았습니다.",
    mockFailed: "테스트 결제에 실패했습니다.",
    paymentNotReady: "결제 준비 중입니다. 잠시 후 다시 이용해 주세요.",
    loadFailed: "풀이를 불러오지 못했습니다.",
    generationFailed: "풀이 생성 중 문제가 생겼습니다.",
    refunded: "환불 처리되었습니다.",
    agreeBefore: "디지털 콘텐츠 특성상 결제 후 작성이 시작되면 청약철회(환불)가 제한됨을 확인했습니다. (",
    refundPolicy: "환불정책",
    agreeAfter: ")",
    checkingPayment: "결제 확인 중…",
    payButton: (price: string, followup: boolean) => `${price} 결제하고 ${followup ? "답변" : "풀이"} 보기`,
    mockNotice: "테스트 모드: 실제 결제 없이 열립니다.",
    writingReading: "상담가가 명식을 살펴보고 있습니다… (1~3분 정도 걸려요)",
    writingAnswer: "답변을 작성하고 있습니다… (1분 정도 걸려요)",
    retry: "다시 시도",
    doneNotice: "이 풀이는 AI가 작성한 참고용 콘텐츠입니다. 이 페이지 주소를 저장해 두면 언제든 다시 볼 수 있습니다.",
    followupTitle: "더 궁금한 것이 있나요?",
    followupText: (price: string) => `위 풀이를 바탕으로 한 가지를 더 깊이 물어볼 수 있습니다. 질문 1회 ${price}.`,
    followupPlaceholder: "예) 그럼 이직은 언제쯤이 좋을까요?",
    followupSubmitting: "등록 중…",
    followupSubmit: "질문 등록하기",
    followupName: "추가 질문",
  },
  en: {
    fallbackError: "Something went wrong. Please try again in a moment.",
    paymentCancelled: "The payment was cancelled.",
    paymentIncomplete: "The payment was not completed.",
    mockFailed: "Test payment failed.",
    paymentNotReady: "Payments are not available yet. Please try again later.",
    loadFailed: "We couldn't load your reading.",
    generationFailed: "Something went wrong while writing your reading.",
    refunded: "This purchase has been refunded.",
    agreeBefore:
      "I understand that this is digital content, so once writing starts after payment, it can no longer be refunded. (",
    refundPolicy: "Refund policy, in Korean",
    agreeAfter: ")",
    checkingPayment: "Confirming payment…",
    payButton: (price: string, followup: boolean) => `Pay ${price} and see the ${followup ? "answer" : "full reading"}`,
    mockNotice: "Test mode: opens without a real payment.",
    writingReading: "Your reader is studying your chart… (about 1–3 minutes)",
    writingAnswer: "Writing your answer… (about a minute)",
    retry: "Try again",
    doneNotice: "This reading was written by AI for entertainment and reflection. Bookmark this page to come back to it any time.",
    followupTitle: "Anything else on your mind?",
    followupText: (price: string) => `Ask one more question that builds on the reading above. ${price} per question.`,
    followupPlaceholder: "e.g. So when would be a good time to change jobs?",
    followupSubmitting: "Saving…",
    followupSubmit: "Ask this question",
    followupName: "Follow-up question",
  },
} as const;
