import { randomInt } from "node:crypto";
import { TAROT_CARDS } from "./tarot-cards";
import { SPREAD_SIZE, TAROT_TOPICS, type TarotTopic } from "./tarot-config";

export type TarotInput = {
  topic: TarotTopic;
  question: string;
  /** 섞인 덱 위에서 사용자가 고른 자리(0 ~ SPREAD_SIZE-1), 서로 다른 3개 */
  picks: number[];
};

export type DrawnCard = {
  position: string;
  cardId: string;
  name: string;
  nameEn: string;
  reversed: boolean;
  meaning: string;
};

export type TarotChart = { topicLabel: string; cards: DrawnCard[] };

export function validateTarotInput(raw: unknown): TarotInput {
  const r = raw as Record<string, unknown>;
  const topic = typeof r.topic === "string" && r.topic in TAROT_TOPICS ? (r.topic as TarotTopic) : null;
  if (!topic) throw new Error("질문 주제를 선택해 주세요.");
  const question = typeof r.question === "string" ? r.question.trim().slice(0, 300) : "";
  const picks = Array.isArray(r.picks) ? r.picks : [];
  const valid =
    picks.length === 3 &&
    new Set(picks).size === 3 &&
    picks.every((p) => Number.isInteger(p) && p >= 0 && p < SPREAD_SIZE);
  if (!valid) throw new Error("카드 세 장을 골라 주세요.");
  return { topic, question, picks: picks as number[] };
}

/** 서버에서 암호학적 난수로 덱을 섞고, 사용자가 고른 자리의 카드를 펼친다(각 50% 확률로 역방향). */
export function drawTarot(input: TarotInput): TarotChart {
  const topic = TAROT_TOPICS[input.topic];
  const deck = [...TAROT_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const cards = topic.positions.map((position, i) => {
    const card = deck[input.picks[i]];
    const reversed = randomInt(2) === 1;
    return {
      position,
      cardId: card.id,
      name: card.name,
      nameEn: card.nameEn,
      reversed,
      meaning: reversed ? card.reversed : card.upright,
    };
  });
  return { topicLabel: topic.label, cards };
}
