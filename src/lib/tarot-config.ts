// 클라이언트 컴포넌트에서도 쓰는 타로 설정. 서버 전용 모듈(node:crypto)을 import하지 않는다.
export const TAROT_TOPICS = {
  love: { label: "연애·관계", positions: ["나의 마음", "상대의 마음", "관계의 흐름"] },
  money: { label: "재물·금전", positions: ["현재 상황", "장애물", "조언"] },
  career: { label: "직업·학업", positions: ["현재 상황", "장애물", "조언"] },
  general: { label: "종합운", positions: ["과거", "현재", "미래"] },
} as const;

export type TarotTopic = keyof typeof TAROT_TOPICS;

/** 화면에 깔아 두는 뒷면 카드 수. 사용자는 이 중 3장을 고른다. */
export const SPREAD_SIZE = 24;

/** 별자리 타로(영문)의 질문 주제와 카드 자리 */
export const ZODIAC_TAROT_TOPICS = {
  love: { label: "Love & Relationships", positions: ["Your heart", "Their heart", "Where it's going"] },
  money: { label: "Money", positions: ["Where you stand", "What's in the way", "What to do"] },
  career: { label: "Career & Study", positions: ["Where you stand", "What's in the way", "What to do"] },
  general: { label: "Life in General", positions: ["Past", "Present", "Future"] },
} as const satisfies Record<TarotTopic, { label: string; positions: readonly string[] }>;
