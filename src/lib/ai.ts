import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { SajuChart, SajuInput } from "./saju";
import type { TarotChart, TarotInput } from "./tarot";
import type { ReadingRow } from "./supabase";

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

function sajuPrompt(input: SajuInput, chart: SajuChart) {
  const pillars = chart.pillars
    .map((p) => `${p.label}: ${p.gan}${p.zhi}(${p.ganKo}${p.zhiKo}) — 천간 ${p.ganElement}/${p.ganYinYang}/${p.ganTenGod}, 지지 ${p.zhiElement}/${p.zhiYinYang}/${p.zhiTenGod}, 지장간 ${p.hiddenStems.join("")}`)
    .join("\n");
  const elements = Object.entries(chart.elementCounts).map(([k, v]) => `${k} ${v}`).join(", ");
  const daeun = chart.daeun.map((d) => `${d.startAge}세(${d.startYear}년~) ${d.ganZhi}(${d.ko})`).join(", ");
  return `다음 명식으로 사주 정밀 풀이를 작성해 주세요.

[기본 정보]
이름: ${input.name || "(미입력)"}
성별: ${input.gender === "M" ? "남성" : "여성"}
양력 생일: ${chart.solarDate} / 음력: ${chart.lunarDate}
출생 시각: ${chart.usedTime ? `${chart.usedTime} (${chart.corrections.join(", ") || "보정 없음"})` : "모름 — 시주 없이 세 기둥으로 풀이"}
띠: ${chart.zodiac}

[명식]
${pillars}
일간: ${chart.dayMaster.gan}(${chart.dayMaster.ko}) ${chart.dayMaster.element}
오행 개수: ${elements}

[대운] ${daeun}
[세운] 올해 ${chart.thisYear.year}년 ${chart.thisYear.ganZhi}(${chart.thisYear.ko}), 내년 ${chart.nextYear.year}년 ${chart.nextYear.ganZhi}(${chart.nextYear.ko})

다음 순서로 작성합니다(전체 5,000~7,000자 내외):
## 타고난 기질과 성격
## 오행의 균형과 보완법
## 재물운
## 직업·적성
## 연애·결혼운
## 건강 관리 포인트
## 대운의 흐름 (현재 대운을 중심으로)
## ${chart.thisYear.year}년과 ${chart.nextYear.year}년의 운세
## 마무리 조언
${COMMON_RULES}`;
}

function tarotPrompt(input: TarotInput, chart: TarotChart) {
  const cards = chart.cards
    .map((c, i) => `${i + 1}. [${c.position}] ${c.name} (${c.nameEn}) ${c.reversed ? "역방향" : "정방향"} — ${c.meaning}`)
    .join("\n");
  return `다음 타로 스프레드로 심층 해석을 작성해 주세요.

주제: ${chart.topicLabel}
질문: ${input.question || "(구체적인 질문 없이 주제 전반에 대해)"}

[뽑힌 카드]
${cards}

다음 순서로 작성합니다(전체 2,500~3,500자 내외):
## 카드별 해석 (각 카드를 위치의 의미와 엮어서, 카드마다 ### 소제목)
## 세 장이 함께 말하는 이야기
## 질문에 대한 답
## 조언
${COMMON_RULES}`;
}

/** 결제 완료된 풀이의 AI 해석을 스트리밍한다. 텍스트 조각을 차례로 yield한다. */
export async function* streamReading(reading: ReadingRow): AsyncGenerator<string> {
  const anthropic = new Anthropic();
  const prompt =
    reading.kind === "saju"
      ? sajuPrompt(reading.input as unknown as SajuInput, reading.chart as unknown as SajuChart)
      : tarotPrompt(reading.input as unknown as TarotInput, reading.chart as unknown as TarotChart);

  const stream = anthropic.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    // 안전 분류기가 요청을 거절하면 서버 측에서 권장 모델로 다시 시도한다.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system:
      reading.kind === "saju"
        ? "당신은 30년 경력의 명리학 상담가입니다. 자평명리 이론에 밝고, 어려운 용어는 일상 언어로 풀어 설명합니다."
        : "당신은 따뜻하고 통찰력 있는 타로 리더입니다. 라이더-웨이트 덱의 상징에 밝고, 카드의 이미지를 생생하게 묘사하며 해석합니다.",
    messages: [{ role: "user", content: prompt }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") throw new Error("풀이 생성이 거절되었습니다.");
}
