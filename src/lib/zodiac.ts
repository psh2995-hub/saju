import { Solar } from "lunar-javascript";
import { ANIMAL_TRAIT_EN, kSign } from "./en";
import { drawCards, validateTarotInput, type DrawnCard } from "./tarot";
import { TAROT_CARDS } from "./tarot-cards";
import { ZODIAC_TAROT_TOPICS, type TarotTopic } from "./tarot-config";
import { sunSign, type SignKey } from "./zodiac-signs";

/** 별자리 타로(영문 전용): 생일로 별자리와 한국 띠를 정하고, 별자리 카드와 함께 세 장을 펼친다. */
export type ZodiacTarotInput = {
  name?: string;
  year: number;
  month: number;
  day: number;
  topic: TarotTopic;
  question: string;
  picks: number[];
};

export type ZodiacTarotChart = {
  sign: SignKey;
  /** 입춘 기준 출생 연도의 간지와 영문 이름(예: 丙午, Yang Fire Horse) */
  animal: { ganZhi: string; name: string; trait: string };
  /** 별자리에 대응하는 메이저 아르카나 */
  birthCard: { cardId: string; name: string; meaning: string };
  topicLabel: string;
  cards: DrawnCard[];
};

export function validateZodiacTarotInput(raw: unknown): ZodiacTarotInput {
  const r = raw as Record<string, unknown>;
  const { topic, question, picks } = validateTarotInput(raw);
  const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) ? v : NaN);
  const [year, month, day] = [int(r.year), int(r.month), int(r.day)];
  if (!(year >= 1920 && year <= 2030)) throw new Error("출생 연도는 1920~2030년 사이여야 합니다.");
  if (new Date(Date.UTC(year, month - 1, day)).getUTCDate() !== day || !(month >= 1 && month <= 12)) {
    throw new Error("존재하지 않는 날짜입니다.");
  }
  const name = typeof r.name === "string" ? r.name.trim().slice(0, 20) : undefined;
  return { name, year, month, day, topic, question, picks };
}

export function drawZodiacTarot(input: ZodiacTarotInput): ZodiacTarotChart {
  const sign = sunSign(input.month, input.day);
  // 띠는 입춘 기준. 입춘 당일생은 시각을 모르므로 정오로 본다.
  const ganZhi = Solar.fromYmdHms(input.year, input.month, input.day, 12, 0, 0).getLunar().getYearInGanZhiByLiChun();
  const card = TAROT_CARDS.find((c) => c.id === `major-${sign.card}`)!;
  const topic = ZODIAC_TAROT_TOPICS[input.topic];
  return {
    sign: sign.key,
    animal: { ganZhi, name: kSign(ganZhi), trait: ANIMAL_TRAIT_EN[ganZhi[1]] },
    birthCard: { cardId: card.id, name: card.nameEn, meaning: card.uprightEn },
    topicLabel: topic.label,
    cards: drawCards(input.picks, topic.positions, "en"),
  };
}
