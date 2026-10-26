import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";
import { calculateSaju, validateSajuInput } from "@/lib/saju";
import { db } from "@/lib/supabase";
import { drawTarot, validateTarotInput } from "@/lib/tarot";
import type { Json } from "@/lib/database.types";

export async function POST(request: Request) {
  let body: { kind?: string; input?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  let input: object;
  let chart: object;
  try {
    if (body.kind === "saju") {
      const sajuInput = validateSajuInput(body.input);
      input = sajuInput;
      chart = calculateSaju(sajuInput);
    } else if (body.kind === "tarot") {
      const tarotInput = validateTarotInput(body.input);
      input = tarotInput;
      chart = drawTarot(tarotInput);
    } else {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "입력값을 확인해 주세요." }, { status: 400 });
  }

  const { data, error } = await db()
    .from("readings")
    .insert({ kind: body.kind, input: input as Json, chart: chart as Json, price: PRODUCTS[body.kind].price })
    .select("id")
    .single();
  if (error) {
    console.error("reading insert failed", error);
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
