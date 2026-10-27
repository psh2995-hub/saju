import { ANIMAL_EN, ELEMENT_EN } from "./en";
import type { Lang } from "./i18n";
import { josa } from "./korean";
import { calculateSaju, elementRelation, ZODIAC, validateSajuInput, type Element, type SajuChart, type SajuInput } from "./saju";

export type GunghapInput = { a: SajuInput; b: SajuInput };

export type GunghapPoint = { title: string; text: string; tone: "good" | "care" | "neutral" };

export type GunghapChart = { a: SajuChart; b: SajuChart; points: GunghapPoint[] };

const STEM_COMBINE: Record<string, Element> = { 甲己: "토", 乙庚: "금", 丙辛: "수", 丁壬: "목", 戊癸: "화" };
const BRANCH_COMBINE = new Set(["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"]);
const BRANCH_CLASH = new Set(["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"]);
const BRANCH_RESENT = new Set(["子未", "丑午", "寅酉", "卯申", "辰亥", "巳戌"]);
const TRIPLE_GROUPS = ["申子辰", "寅午戌", "巳酉丑", "亥卯未"];

const pairKey = (x: string, y: string, set: Set<string> | Record<string, unknown>) =>
  (set instanceof Set ? set.has(x + y) || set.has(y + x) : x + y in set || y + x in set);

function day(chart: SajuChart) {
  return chart.pillars.find((p) => p.label === "일주")!;
}
function year(chart: SajuChart) {
  return chart.pillars.find((p) => p.label === "연주")!;
}

export function validateGunghapInput(raw: unknown): GunghapInput {
  const r = raw as Record<string, unknown>;
  return { a: validateSajuInput(r?.a), b: validateSajuInput(r?.b) };
}

/** 두 사람의 명식에서 일간·일지·띠·오행 보완 관계를 뽑아 무료 요약으로 보여 준다. */
export function calculateGunghap(input: GunghapInput, now = new Date(), lang: Lang = "ko"): GunghapChart {
  if (lang === "en") return calculateGunghapEn(input, now);
  const a = calculateSaju(input.a, now);
  const b = calculateSaju(input.b, now);
  const nameA = input.a.name || "나";
  const nameB = input.b.name || "상대";
  const points: GunghapPoint[] = [];

  const da = day(a);
  const db = day(b);
  const combined = STEM_COMBINE[da.gan + db.gan] ?? STEM_COMBINE[db.gan + da.gan];
  if (combined) {
    points.push({
      title: `일간 천간합 ${da.gan}${db.gan}合`,
      text: `두 사람의 중심 글자가 서로 끌어당기는 합을 이룹니다. 처음 만났을 때부터 묘하게 편안하고 끌리는 인연입니다.`,
      tone: "good",
    });
  }

  // 이름이 없으면 "나"/"상대"로 부른다. "나"의 주격은 "내가".
  const subj = (name: string) => (name === "나" ? "내가" : josa(name, "이", "가"));
  const rel = elementRelation(a.dayMaster.element, b.dayMaster.element);
  const ea = a.dayMaster.element;
  const eb = b.dayMaster.element;
  const relText: Record<number, GunghapPoint> = {
    0: { title: "같은 오행의 일간", text: `둘 다 ${ea}의 기운이라 생각과 속도가 닮았습니다. 친구처럼 편하지만 고집이 부딪칠 때는 양보가 필요합니다.`, tone: "neutral" },
    1: { title: `${subj(nameA)} ${josa(nameB, "을", "를")} 북돋는 관계`, text: `${josa(ea, "이", "가")} ${josa(eb, "을", "를")} 생합니다. ${subj(nameA)} 자연스럽게 챙기고 ${subj(nameB)} 그 덕에 힘을 얻는 흐름입니다.`, tone: "good" },
    [-1]: { title: `${subj(nameB)} ${josa(nameA, "을", "를")} 북돋는 관계`, text: `${josa(eb, "이", "가")} ${josa(ea, "을", "를")} 생합니다. ${subj(nameB)} 든든한 버팀목이 되어 주는 흐름입니다.`, tone: "good" },
    2: { title: `${subj(nameA)} 이끄는 관계`, text: `${josa(ea, "이", "가")} ${josa(eb, "을", "를")} 극합니다. ${subj(nameA)} 주도권을 쥐기 쉬우니 상대의 속도를 존중하는 것이 관건입니다.`, tone: "care" },
    [-2]: { title: `${subj(nameB)} 이끄는 관계`, text: `${josa(eb, "이", "가")} ${josa(ea, "을", "를")} 극합니다. ${nameB}의 말에 긴장하기 쉬우니 서운함을 쌓아 두지 않는 것이 중요합니다.`, tone: "care" },
  };
  points.push(relText[rel]);

  if (pairKey(da.zhi, db.zhi, BRANCH_COMBINE)) {
    points.push({ title: `일지 육합 ${da.zhi}${db.zhi}`, text: "배우자 자리(일지)끼리 합을 이뤄 생활 리듬과 정서가 잘 맞습니다.", tone: "good" });
  } else if (pairKey(da.zhi, db.zhi, BRANCH_CLASH)) {
    points.push({ title: `일지 충 ${da.zhi}${db.zhi}`, text: "배우자 자리끼리 부딪혀 생활 습관에서 마찰이 생기기 쉽습니다. 대신 서로를 변화시키는 자극이 되기도 합니다.", tone: "care" });
  }

  const ya = year(a).zhi;
  const yb = year(b).zhi;
  const zodiacText = `${ZODIAC[ya]}띠와 ${ZODIAC[yb]}띠`;
  if (ya !== yb && TRIPLE_GROUPS.some((g) => g.includes(ya) && g.includes(yb))) {
    points.push({ title: `${zodiacText} — 삼합`, text: "같은 방향을 바라보는 띠 궁합입니다. 함께 목표를 세우면 힘이 붙습니다.", tone: "good" });
  } else if (pairKey(ya, yb, BRANCH_COMBINE)) {
    points.push({ title: `${zodiacText} — 육합`, text: "서로를 채워 주는 띠 궁합입니다.", tone: "good" });
  } else if (pairKey(ya, yb, BRANCH_CLASH)) {
    points.push({ title: `${zodiacText} — 충`, text: "성향이 정반대라 끌리면서도 부딪치는 띠 궁합입니다.", tone: "care" });
  } else if (pairKey(ya, yb, BRANCH_RESENT)) {
    points.push({ title: `${zodiacText} — 원진`, text: "작은 오해가 쌓이기 쉬운 띠 궁합입니다. 말로 확인하는 습관이 관계를 지킵니다.", tone: "care" });
  }

  const fills = (from: SajuChart, to: SajuChart) =>
    (Object.keys(to.elementCounts) as Element[]).filter((el) => to.elementCounts[el] === 0 && from.elementCounts[el] >= 2);
  const aGives = fills(a, b);
  const bGives = fills(b, a);
  if (aGives.length || bGives.length) {
    const parts = [
      aGives.length ? `${subj(nameA)} ${nameB}에게 없는 ${josa(aGives.join("·"), "을", "를")}` : "",
      bGives.length ? `${subj(nameB)} ${nameA}에게 없는 ${josa(bGives.join("·"), "을", "를")}` : "",
    ].filter(Boolean);
    points.push({ title: "오행 보완", text: `${parts.join(", ")} 채워 줍니다. 함께 있을 때 균형이 맞춰지는 관계입니다.`, tone: "good" });
  }

  return { a, b, points };
}


/** 영문 궁합 포인트. 판단 기준은 한국어와 같고 문장만 영어로 쓴다. */
function calculateGunghapEn(input: GunghapInput, now: Date): GunghapChart {
  const a = calculateSaju(input.a, now);
  const b = calculateSaju(input.b, now);
  const nameA = input.a.name || "You";
  const nameB = input.b.name || "your partner";
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  const points: GunghapPoint[] = [];

  const da = day(a);
  const db = day(b);
  if (STEM_COMBINE[da.gan + db.gan] ?? STEM_COMBINE[db.gan + da.gan]) {
    points.push({
      title: `Heavenly Stem combination ${da.gan}${db.gan}`,
      text: "Your two core characters pull toward each other. It is the kind of bond that feels oddly comfortable and magnetic from the very first meeting.",
      tone: "good",
    });
  }

  const ea = ELEMENT_EN[a.dayMaster.element];
  const eb = ELEMENT_EN[b.dayMaster.element];
  const relText: Record<number, GunghapPoint> = {
    0: { title: "Same element at the core", text: `You are both ${ea} people, so you think and move at a similar pace. Easy as friends, but when stubbornness clashes, someone has to give way.`, tone: "neutral" },
    1: { title: `${cap(nameA)} lift${nameA === "You" ? "" : "s"} ${nameB} up`, text: `${ea} feeds ${eb}. ${cap(nameA)} naturally take${nameA === "You" ? "" : "s"} care, and ${nameB} draws strength from it.`, tone: "good" },
    [-1]: { title: `${cap(nameB)} lifts ${nameA === "You" ? "you" : nameA} up`, text: `${eb} feeds ${ea}. ${cap(nameB)} becomes a steady source of support.`, tone: "good" },
    2: { title: `${cap(nameA)} tend${nameA === "You" ? "" : "s"} to lead`, text: `${ea} controls ${eb}. ${cap(nameA)} easily take${nameA === "You" ? "" : "s"} the lead, so respecting the other's pace is the key.`, tone: "care" },
    [-2]: { title: `${cap(nameB)} tends to lead`, text: `${eb} controls ${ea}. Words from ${nameB} can feel sharp, so don't let small hurts pile up unspoken.`, tone: "care" },
  };
  points.push(relText[elementRelation(a.dayMaster.element, b.dayMaster.element)]);

  if (pairKey(da.zhi, db.zhi, BRANCH_COMBINE)) {
    points.push({ title: `Day branches combine ${da.zhi}${db.zhi}`, text: "Your partner palaces (the day branches) harmonize, so daily rhythms and moods tend to match.", tone: "good" });
  } else if (pairKey(da.zhi, db.zhi, BRANCH_CLASH)) {
    points.push({ title: `Day branches clash ${da.zhi}${db.zhi}`, text: "Your partner palaces collide, so daily habits can cause friction. The upside: you push each other to grow.", tone: "care" });
  }

  const ya = year(a).zhi;
  const yb = year(b).zhi;
  const animals = `${ANIMAL_EN[ya]} and ${ANIMAL_EN[yb]}`;
  if (ya !== yb && TRIPLE_GROUPS.some((g) => g.includes(ya) && g.includes(yb))) {
    points.push({ title: `${animals} — a natural trio`, text: "Your zodiac animals look in the same direction. Set goals together and you gain momentum.", tone: "good" });
  } else if (pairKey(ya, yb, BRANCH_COMBINE)) {
    points.push({ title: `${animals} — a matching pair`, text: "Your zodiac animals complete each other.", tone: "good" });
  } else if (pairKey(ya, yb, BRANCH_CLASH)) {
    points.push({ title: `${animals} — opposites`, text: "Opposite temperaments: you attract each other and clash for the same reason.", tone: "care" });
  } else if (pairKey(ya, yb, BRANCH_RESENT)) {
    points.push({ title: `${animals} — easily misunderstood`, text: "Small misunderstandings pile up easily between these animals. Checking in with words protects the relationship.", tone: "care" });
  }

  const fills = (from: SajuChart, to: SajuChart) =>
    (Object.keys(to.elementCounts) as Element[]).filter((el) => to.elementCounts[el] === 0 && from.elementCounts[el] >= 2).map((el) => ELEMENT_EN[el]);
  const aGives = fills(a, b);
  const bGives = fills(b, a);
  if (aGives.length || bGives.length) {
    const parts = [
      aGives.length ? `${cap(nameA)} bring${nameA === "You" ? "" : "s"} the ${aGives.join(" and ")} ${nameB} lacks` : "",
      bGives.length ? `${aGives.length ? nameB : cap(nameB)} brings the ${bGives.join(" and ")} ${nameA === "You" ? "you lack" : `${nameA} lacks`}` : "",
    ].filter(Boolean);
    points.push({ title: "Elements that fill each other in", text: `${parts.join(", and ")}. Together you find your balance.`, tone: "good" });
  }

  return { a, b, points };
}
