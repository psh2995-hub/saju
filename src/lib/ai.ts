import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { TEN_GOD_EN } from "./en";
import type { GunghapChart, GunghapInput } from "./gunghap";
import type { NewYearChart } from "./newyear";
import type { SajuChart, SajuInput } from "./saju";
import type { FollowupRow, ReadingRow } from "./supabase";
import type { TarotChart, TarotInput } from "./tarot";
import type { ZodiacTarotChart, ZodiacTarotInput } from "./zodiac";
import { SIGNS } from "./zodiac-signs";

const MODEL = "claude-opus-5-5";

const COMMON_RULES = `
작성 원칙:
- 한국어 존댓말로, 상담가가 마주 앉아 이야기하듯 따뜻하고 구체적으로 씁니다.
- Markdown으로 작성합니다. 큰 주제는 "## 제목", 필요하면 "### 소제목"을 쓰고, 표는 쓰지 않습니다.
- 막연한 덕담 대신 주어진 명식/카드에 근거한 구체적인 이야기를 하고, 그 근거를 쉬운 말로 함께 설명합니다.
- 풀이는 참고용 오락 콘텐츠입니다. 질병 진단, 투자 종목·시점, 법률 판단처럼 전문가가 판단해야 할 내용은 단정하지 않고 전문가 상담을 권합니다.
- 죽음, 큰 사고, 이혼 등을 단정적으로 예언하거나 공포를 조장하지 않습니다. 어려운 시기는 대비하는 방법과 함께 이야기합니다.
- 부적, 굿, 추가 유료 상담 등 다른 상품 구매를 권하지 않습니다.
- 마지막 문단은 오늘부터 실천할 수 있는 조언 한두 가지로 맺습니다.`;

const COMMON_RULES_EN = `
Writing guidelines:
- Write entirely in natural, warm English, like a counselor sitting across from the reader. Be specific and personal.
- Use Markdown: "## " for main sections and "### " for subsections when needed. No tables.
- Ground every point in the given chart or cards, and explain the reasoning in plain words. Avoid empty platitudes.
- The chart data is written in Korean. Translate it; never output Korean script. Chinese characters may appear only as the pillar characters shown in the data (e.g. 己卯).
- When you mention a Korean concept, give the English name first and the romanized Korean term once in parentheses, e.g. Day Pillar (ilju), Ten-year Luck Cycle (daeun), Five Elements (oheng).
- Name the Ten Gods exactly as the site does: ${Object.entries(TEN_GOD_EN)
  .map(([ko, en]) => `${ko} = ${en}`)
  .join(", ")}.
- This reading is for entertainment and reflection. Don't make definitive calls on health, investments or legal matters; suggest a professional instead.
- Never predict death, serious accidents or divorce, and don't use fear. Present hard periods together with ways to prepare.
- Don't recommend talismans, rituals or other paid services.
- End with one or two practical things the reader can start today.`;

const SYSTEM_SAJU_EN =
  "You are a Korean Saju (Four Pillars of Destiny) master with 30 years of experience who introduces Korean astrology to readers around the world. You explain Korean concepts simply and vividly, and when it helps, you briefly compare them with Western astrology the reader may know.";
const SYSTEM_ZODIAC_EN =
  "You are a warm, insightful tarot reader who is also fluent in Western astrology and the Korean zodiac. You know the Rider-Waite deck's symbolism deeply and describe each card's imagery vividly as you interpret it.";

const SYSTEM_SAJU = "당신은 30년 경력의 명리학 상담가입니다. 자평명리 이론에 밝고, 어려운 용어는 일상 언어로 풀어 설명합니다.";
const SYSTEM_TAROT =
  "당신은 따뜻하고 통찰력 있는 타로 리더입니다. 라이더-웨이트 덱의 상징에 밝고, 카드의 이미지를 생생하게 묘사하며 해석합니다.";

function describeChart(chart: SajuChart, input: SajuInput, title = "명식") {
  const pillars = chart.pillars
    .map((p) => `${p.label}: ${p.gan}${p.zhi}(${p.ganKo}${p.zhiKo}) — 천간 ${p.ganElement}/${p.ganYinYang}/${p.ganTenGod}, 지지 ${p.zhiElement}/${p.zhiYinYang}/${p.zhiTenGod}, 지장간 ${p.hiddenStems.join("")}`)
    .join("\n");
  const elements = Object.entries(chart.elementCounts).map(([k, v]) => `${k} ${v}`).join(", ");
  const daeun = chart.daeun.map((d) => `${d.startAge}세(${d.startYear}년~) ${d.ganZhi}(${d.ko})`).join(", ");
  return `[${title}]
이름: ${input.name || "(미입력)"} / 성별: ${input.gender === "M" ? "남성" : "여성"}
양력 생일: ${chart.solarDate} / 음력: ${chart.lunarDate} / 띠: ${chart.zodiac}
출생 시각: ${chart.usedTime ? `${chart.usedTime} (${chart.corrections.join(", ") || "보정 없음"})` : "모름 — 시주 없이 세 기둥으로 풀이"}${input.timeZone ? `\n출생지 시간대: ${input.timeZone} (출생지 시계 기준으로 계산)` : ""}
${pillars}
일간: ${chart.dayMaster.gan}(${chart.dayMaster.ko}) ${chart.dayMaster.element}
오행 개수: ${elements}
대운: ${daeun}`;
}

function describeZodiacTarot(input: ZodiacTarotInput, chart: ZodiacTarotChart) {
  const sign = SIGNS.find((s) => s.key === chart.sign)!;
  const cards = chart.cards
    .map((c, i) => `${i + 1}. [${c.position}] ${c.name} ${c.reversed ? "reversed" : "upright"} — ${c.meaning}`)
    .join("\n");
  return `Name: ${input.name || "(not given)"}
Birthday: ${input.year}-${input.month}-${input.day}
Sun sign: ${sign.name} ${sign.symbol} (${sign.dates}) — ${sign.element} sign, ${sign.modality}, ruled by ${sign.ruler}; keywords: ${sign.keywords}
Birth card of the sign: ${chart.birthCard.name} — ${chart.birthCard.meaning}
Korean zodiac (by birth year, counted from Ipchun): ${chart.animal.ganZhi} ${chart.animal.name} — ${chart.animal.trait}
Topic: ${chart.topicLabel}
Question: ${input.question || "(no specific question; read the topic as a whole)"}
[Cards drawn]
${cards}`;
}

function describeTarot(input: TarotInput, chart: TarotChart) {
  const cards = chart.cards
    .map((c, i) => `${i + 1}. [${c.position}] ${c.name} (${c.nameEn}) ${c.reversed ? "역방향" : "정방향"} — ${c.meaning}`)
    .join("\n");
  return `주제: ${chart.topicLabel}
질문: ${input.question || "(구체적인 질문 없이 주제 전반에 대해)"}
[뽑힌 카드]
${cards}`;
}

function describeNewYear(input: SajuInput, chart: NewYearChart) {
  const y = chart.year;
  const months = chart.months.map((m) => `${m.label} ${m.ganZhi}(${m.ko}) 천간 ${m.ganTenGod}/지지 ${m.zhiTenGod}`).join("\n");
  return `${describeChart(chart.base, input)}

[${y.year}년 세운] ${y.ganZhi}(${y.ko}) — 일간 기준 천간 ${y.ganTenGod}, 지지 ${y.zhiTenGod}
[그해의 대운] ${chart.daeun ? `${chart.daeun.startAge}세부터 ${chart.daeun.ganZhi}(${chart.daeun.ko})` : "대운 시작 전"}
[월운 — 절기 기준, 입춘부터]
${months}`;
}

function describeGunghap(input: GunghapInput, chart: GunghapChart) {
  const points = chart.points.map((p) => `- ${p.title}: ${p.text}`).join("\n");
  return `${describeChart(chart.a, input.a, `${input.a.name || "첫째 사람"}의 명식`)}

${describeChart(chart.b, input.b, `${input.b.name || "둘째 사람"}의 명식`)}

[미리 계산한 궁합 포인트]
${points}`;
}

type Request = { system: string; context: string; instructions: string; rules: string };

function requestFor(reading: ReadingRow): Request {
  return reading.lang === "en" ? requestForEn(reading) : { ...requestForKo(reading), rules: COMMON_RULES };
}

function requestForEn(reading: ReadingRow): Request {
  const input = reading.input as never;
  const chart = reading.chart as never;
  switch (reading.kind) {
    case "zodiac": {
      const c = chart as ZodiacTarotChart;
      const sign = SIGNS.find((s) => s.key === c.sign)!;
      return {
        system: SYSTEM_ZODIAC_EN,
        context: describeZodiacTarot(input, c),
        instructions: `Write an in-depth Zodiac Tarot reading for the spread above, in this order (about 900–1,300 words in total):
## ${sign.name} and Your Question (how the sign's nature and its birth card, ${c.birthCard.name}, color this question)
## The Cards (one ### subsection per card, tying each card to its position and to ${sign.name})
## The Story the Three Cards Tell
## The Answer to Your Question
## Your Korean Zodiac Twist (a short section on the ${c.animal.name} and what it adds)
## Advice`,
        rules: COMMON_RULES_EN,
      };
    }
    case "newyear": {
      const c = chart as NewYearChart;
      return {
        system: SYSTEM_SAJU_EN,
        context: describeNewYear(input, c),
        instructions: `Using the chart above and the ${c.year.year} yearly and monthly energies, write a ${c.year.year} K-Zodiac Forecast in this order (about 1,800–2,500 words in total):
## Your ${c.year.year} at a Glance (what the year's energy means for the Day Master, and how it sits within the current Ten-year Luck Cycle)
## Money
## Career & Study
## Love & Relationships
## Health
## Month by Month (from February through the following January, a ### subsection for each month with 2–4 sentences; Korean months start at the solar terms, so February begins at Ipchun around Feb 4)
## Making the Most of ${c.year.year}`,
        rules: COMMON_RULES_EN,
      };
    }
    default: {
      const c = chart as SajuChart;
      return {
        system: SYSTEM_SAJU_EN,
        context: `${describeChart(c, input)}\n세운: 올해 ${c.thisYear.year}년 ${c.thisYear.ganZhi}(${c.thisYear.ko}), 내년 ${c.nextYear.year}년 ${c.nextYear.ganZhi}(${c.nextYear.ko})`,
        instructions: `Write an in-depth Korean Birth Chart (Saju) reading for the chart above, in this order (about 2,000–2,800 words in total):
## Your Core Nature (start from the Day Pillar)
## Your Five Elements Balance and How to Support It
## Wealth
## Career & Talents
## Love & Partnership
## Health
## Your Ten-year Luck Cycles (focus on the current one)
## ${c.thisYear.year} and ${c.nextYear.year}
## Final Advice`,
        rules: COMMON_RULES_EN,
      };
    }
  }
}

function requestForKo(reading: ReadingRow): Omit<Request, "rules"> {
  const input = reading.input as never;
  const chart = reading.chart as never;
  switch (reading.kind) {
    case "saju": {
      const c = chart as SajuChart;
      return {
        system: SYSTEM_SAJU,
        context: `${describeChart(c, input)}\n세운: 올해 ${c.thisYear.year}년 ${c.thisYear.ganZhi}(${c.thisYear.ko}), 내년 ${c.nextYear.year}년 ${c.nextYear.ganZhi}(${c.nextYear.ko})`,
        instructions: `위 명식으로 사주 정밀 풀이를 작성해 주세요. 다음 순서로 씁니다(전체 5,000~7,000자 내외):
## 타고난 기질과 성격
## 오행의 균형과 보완법
## 재물운
## 직업·적성
## 연애·결혼운
## 건강 관리 포인트
## 대운의 흐름 (현재 대운을 중심으로)
## ${c.thisYear.year}년과 ${c.nextYear.year}년의 운세
## 마무리 조언`,
      };
    }
    case "tarot":
    case "zodiac":
      return {
        system: SYSTEM_TAROT,
        context: describeTarot(input, chart),
        instructions: `위 타로 스프레드로 심층 해석을 작성해 주세요. 다음 순서로 씁니다(전체 2,500~3,500자 내외):
## 카드별 해석 (각 카드를 위치의 의미와 엮어서, 카드마다 ### 소제목)
## 세 장이 함께 말하는 이야기
## 질문에 대한 답
## 조언`,
      };
    case "newyear": {
      const c = chart as NewYearChart;
      return {
        system: SYSTEM_SAJU,
        context: describeNewYear(input, c),
        instructions: `위 명식과 ${c.year.year}년 세운·월운으로 ${c.year.year}년 신년운세를 작성해 주세요. 다음 순서로 씁니다(전체 5,000~7,000자 내외):
## ${c.year.year}년 총운 (세운이 일간에 주는 의미, 대운과의 관계)
## 재물운
## 직업·학업운
## 연애·인간관계운
## 건강운
## 월별 운세 (2월부터 다음 해 1월까지, 달마다 ### 소제목과 2~4문장)
## ${c.year.year}년을 잘 보내는 법`,
      };
    }
    case "gunghap": {
      const i = input as GunghapInput;
      return {
        system: SYSTEM_SAJU,
        context: describeGunghap(i, chart),
        instructions: `위 두 사람의 명식으로 궁합 풀이를 작성해 주세요. 두 사람을 이름(없으면 "나", "상대")으로 부르고, 한쪽 편을 들지 않습니다. 다음 순서로 씁니다(전체 5,000~7,000자 내외):
## 두 사람의 첫인상과 끌림
## 성격과 대화 방식의 궁합
## 연애할 때 / 함께 살 때
## 부딪히기 쉬운 지점과 푸는 법
## 재물·생활 궁합
## 앞으로 몇 년의 흐름 (두 사람의 대운과 올해·내년 세운)
## 이 관계를 위한 조언`,
      };
    }
  }
}

/** 텍스트 조각을 차례로 yield하는 스트리밍 요청 */
async function* streamText(system: string, user: string, maxTokens: number): AsyncGenerator<string> {
  const anthropic = new Anthropic();
  const stream = anthropic.beta.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    // 안전 분류기가 요청을 거절하면 서버 측에서 권장 모델로 다시 시도한다.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: [{ role: "user", content: user }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") throw new Error("풀이 생성이 거절되었습니다.");
}

/** 결제 완료된 풀이의 AI 해석을 스트리밍한다. */
export function streamReading(reading: ReadingRow) {
  const r = requestFor(reading);
  return streamText(r.system, `${r.context}\n\n${r.instructions}\n${r.rules}`, 32000);
}

/** 추가 질문에 대한 답을 스트리밍한다. 원래 풀이와 이전 질문·답을 함께 넘긴다. */
export function streamFollowup(reading: ReadingRow, previous: FollowupRow[], followup: FollowupRow) {
  const r = requestFor(reading);
  const history = previous
    .filter((f) => f.ai_status === "done" && f.ai_result)
    .map((f) => `Q. ${f.question}\nA. ${f.ai_result}`)
    .join("\n\n");
  const user =
    reading.lang === "en"
      ? `${r.context}

[Reading already delivered]
${reading.ai_result ?? "(none)"}
${history ? `\n[Earlier follow-up questions and answers]\n${history}\n` : ""}
[New question]
${followup.question}

Continuing from the chart (or cards) and the reading already delivered, answer only the new question.
- About 400–700 words. Don't start with a "## " heading; go straight into the answer, using "### " subheadings if useful.
- Stay consistent with the earlier reading and don't repeat it.
- If the question can't be answered from the chart or cards (lottery numbers for a date, private details about other people, etc.), gently explain why and suggest a helpful direction.
${r.rules}`
      : `${r.context}

[이미 전해 드린 풀이]
${reading.ai_result ?? "(없음)"}
${history ? `\n[이전 추가 질문과 답]\n${history}\n` : ""}
[새 질문]
${followup.question}

위 명식(또는 카드)과 이미 전해 드린 풀이에 이어서, 새 질문에만 집중해 답해 주세요.
- 1,000~2,000자 내외. 맨 앞에 "## " 제목 없이 바로 답으로 시작하고, 필요하면 "### 소제목"을 씁니다.
- 앞 풀이와 모순되지 않게 하고, 같은 내용을 반복하지 않습니다.
- 질문이 명식·카드로 답할 수 없는 내용(특정 날짜의 복권 번호, 다른 사람의 사적인 정보 등)이면 그 이유를 부드럽게 설명하고 도움이 될 만한 방향을 제시합니다.
${r.rules}`;
  return streamText(r.system, user, 16000);
}
