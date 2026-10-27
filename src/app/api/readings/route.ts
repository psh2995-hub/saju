import { NextResponse } from "next/server";
import { calculateGunghap, validateGunghapInput } from "@/lib/gunghap";
import { isLang, type Lang } from "@/lib/i18n";
import { calculateNewYear } from "@/lib/newyear";
import { priceFor, PRODUCTS, type ReadingKind } from "@/lib/products";
import { calculateSaju, validateSajuInput } from "@/lib/saju";
import { db } from "@/lib/supabase";
import { drawTarot, validateTarotInput } from "@/lib/tarot";
import { calculateZodiac, validateZodiacInput } from "@/lib/zodiac";
import type { Json } from "@/lib/database.types";

/** 영문 페이지에서 보여 줄 입력 오류 문구. 계산 모듈의 한국어 메시지를 키로 쓴다. */
const ERRORS_EN: Record<string, string> = {
  "잘못된 요청입니다.": "Invalid request.",
  "입력값을 확인해 주세요.": "Please check what you entered.",
  "잠시 후 다시 시도해 주세요.": "Something went wrong. Please try again in a moment.",
  "출생 연도는 1920~2030년 사이여야 합니다.": "Birth year must be between 1920 and 2030.",
  "월이 올바르지 않습니다.": "Please choose a valid month.",
  "일이 올바르지 않습니다.": "Please choose a valid day.",
  "시간이 올바르지 않습니다.": "Please choose a valid birth time.",
  "존재하지 않는 날짜입니다.": "That date doesn't exist. Please check your birthday.",
  "출생지 시간대가 올바르지 않습니다.": "Please choose a valid birth time zone.",
  "질문 주제를 선택해 주세요.": "Please choose a topic.",
  "카드 세 장을 골라 주세요.": "Please pick three cards.",
  "존재하지 않는 음력 날짜입니다.": "That lunar date doesn't exist. Please check the month and day.",
  "해당 연도에 그 윤달이 없습니다.": "There was no leap month like that in that year.",
};

function fail(message: string, lang: Lang, status = 400) {
  return NextResponse.json({ error: lang === "en" ? (ERRORS_EN[message] ?? ERRORS_EN["입력값을 확인해 주세요."]) : message }, { status });
}

function build(kind: string, raw: unknown, lang: Lang): { input: object; chart: object } | null {
  switch (kind) {
    case "saju": {
      const input = validateSajuInput(raw);
      return { input, chart: calculateSaju(input) };
    }
    case "newyear": {
      const input = validateSajuInput(raw);
      return { input, chart: calculateNewYear(input) };
    }
    case "gunghap": {
      const input = validateGunghapInput(raw);
      return { input, chart: calculateGunghap(input, new Date(), lang) };
    }
    case "tarot": {
      const input = validateTarotInput(raw);
      return { input, chart: drawTarot(input, lang) };
    }
    case "zodiac": {
      const input = validateZodiacInput(raw);
      return { input, chart: calculateZodiac(input) };
    }
    default:
      return null;
  }
}

export async function POST(request: Request) {
  let body: { kind?: string; input?: unknown; lang?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("잘못된 요청입니다.", "ko");
  }
  const lang: Lang = isLang(body.lang) ? body.lang : "ko";
  const kind = body.kind as ReadingKind;
  if (!(kind in PRODUCTS)) return fail("잘못된 요청입니다.", lang);

  let built: ReturnType<typeof build>;
  try {
    built = build(kind, body.input, lang);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "입력값을 확인해 주세요.", lang);
  }
  if (!built) return fail("잘못된 요청입니다.", lang);

  const { data, error } = await db()
    .from("readings")
    .insert({ kind, lang, input: built.input as Json, chart: built.chart as Json, ...priceFor(kind, lang) })
    .select("id")
    .single();
  if (error) {
    console.error("reading insert failed", error);
    return fail("잠시 후 다시 시도해 주세요.", lang, 500);
  }
  return NextResponse.json({ id: data.id });
}
