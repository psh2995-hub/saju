import { Lunar, Solar, type EightChar } from "lunar-javascript";

export type Gender = "M" | "F";
export type Element = "목" | "화" | "토" | "금" | "수";

export type SajuInput = {
  name?: string;
  gender: Gender;
  calendar: "solar" | "lunar";
  leapMonth: boolean;
  year: number;
  month: number;
  day: number;
  /** 시간을 모르면 null */
  hour: number | null;
  minute: number | null;
  /** 서울 경도 기준 진태양시 보정(약 -30분)과 과거 서머타임 보정을 적용할지 */
  solarTimeCorrection: boolean;
};

export type Pillar = {
  label: "시주" | "일주" | "월주" | "연주";
  gan: string;
  zhi: string;
  ganKo: string;
  zhiKo: string;
  ganElement: Element;
  zhiElement: Element;
  ganYinYang: "양" | "음";
  zhiYinYang: "양" | "음";
  ganTenGod: string;
  zhiTenGod: string;
  hiddenStems: string[];
};

export type SajuChart = {
  pillars: Pillar[];
  dayMaster: { gan: string; ko: string; element: Element; yinYang: "양" | "음" };
  elementCounts: Record<Element, number>;
  zodiac: string;
  daeun: { startAge: number; startYear: number; ganZhi: string; ko: string }[];
  daeunStartAge: number;
  solarDate: string;
  lunarDate: string;
  /** 보정 후 실제 계산에 쓴 시각 (시간 모름이면 null) */
  usedTime: string | null;
  corrections: string[];
  thisYear: { year: number; ganZhi: string; ko: string };
  nextYear: { year: number; ganZhi: string; ko: string };
};

const GAN_KO: Record<string, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무", 己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
};
const ZHI_KO: Record<string, string> = {
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사", 午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};
const GAN_ELEMENT: Record<string, Element> = {
  甲: "목", 乙: "목", 丙: "화", 丁: "화", 戊: "토", 己: "토", 庚: "금", 辛: "금", 壬: "수", 癸: "수",
};
const ZHI_ELEMENT: Record<string, Element> = {
  子: "수", 丑: "토", 寅: "목", 卯: "목", 辰: "토", 巳: "화", 午: "화", 未: "토", 申: "금", 酉: "금", 戌: "토", 亥: "수",
};
const YANG_GAN = new Set(["甲", "丙", "戊", "庚", "壬"]);
// 명리학에서 子·午·巳·亥의 음양은 체용(體用) 구분이 있으나, 여기서는 일반적인 지지 순서상의 음양을 쓴다.
const YANG_ZHI = new Set(["子", "寅", "辰", "午", "申", "戌"]);
const ZODIAC: Record<string, string> = {
  子: "쥐", 丑: "소", 寅: "호랑이", 卯: "토끼", 辰: "용", 巳: "뱀", 午: "말", 未: "양", 申: "원숭이", 酉: "닭", 戌: "개", 亥: "돼지",
};
const TEN_GOD_KO: Record<string, string> = {
  比肩: "비견", 劫财: "겁재", 食神: "식신", 伤官: "상관", 偏财: "편재", 正财: "정재",
  七杀: "편관", 正官: "정관", 偏印: "편인", 正印: "정인", 日主: "일간",
};

/**
 * 한국 서머타임 시행 기간 (현지 시각 기준, [시작, 종료)).
 * 1948~1960년, 1987~1988년. 날짜는 공개 자료 기준이며 시작·종료 당일 경계 시각은 0시로 단순화했다.
 */
const KOREA_DST: [string, string][] = [
  ["1948-06-01", "1948-09-13"],
  ["1949-04-03", "1949-09-11"],
  ["1950-04-01", "1950-09-10"],
  ["1951-05-06", "1951-09-09"],
  ["1955-05-05", "1955-09-09"],
  ["1956-05-20", "1956-09-30"],
  ["1957-05-05", "1957-09-22"],
  ["1958-05-04", "1958-09-21"],
  ["1959-05-03", "1959-09-20"],
  ["1960-05-01", "1960-09-18"],
  ["1987-05-10", "1987-10-11"],
  ["1988-05-08", "1988-10-09"],
];

/** 1954-03-21 ~ 1961-08-09에는 표준시가 UTC+8:30(동경 127.5도)이라 경도 보정이 거의 필요 없다. */
function longitudeCorrectionMinutes(ymd: string): number {
  if (ymd >= "1954-03-21" && ymd < "1961-08-10") return 0;
  return -30;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function shiftMinutes(s: Solar, minutes: number): Solar {
  const t = Date.UTC(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour(), s.getMinute()) + minutes * 60_000;
  const d = new Date(t);
  return Solar.fromYmdHms(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), 0);
}

export function koGanZhi(ganZhi: string): string {
  return [...ganZhi].map((c) => GAN_KO[c] ?? ZHI_KO[c] ?? c).join("");
}

function buildPillar(
  label: Pillar["label"],
  gan: string,
  zhi: string,
  ganTenGod: string,
  zhiTenGods: string[],
  hidden: string[],
): Pillar {
  return {
    label,
    gan,
    zhi,
    ganKo: GAN_KO[gan],
    zhiKo: ZHI_KO[zhi],
    ganElement: GAN_ELEMENT[gan],
    zhiElement: ZHI_ELEMENT[zhi],
    ganYinYang: YANG_GAN.has(gan) ? "양" : "음",
    zhiYinYang: YANG_ZHI.has(zhi) ? "양" : "음",
    ganTenGod: TEN_GOD_KO[ganTenGod] ?? ganTenGod,
    // 지지의 십성은 지장간의 본기(배열 첫 번째)를 기준으로 표시한다.
    zhiTenGod: TEN_GOD_KO[zhiTenGods[0]] ?? zhiTenGods[0],
    hiddenStems: hidden.map((h) => GAN_KO[h] ?? h),
  };
}

export function validateSajuInput(raw: unknown): SajuInput {
  const r = raw as Record<string, unknown>;
  const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) ? v : NaN);
  const input: SajuInput = {
    name: typeof r.name === "string" ? r.name.trim().slice(0, 20) : undefined,
    gender: r.gender === "F" ? "F" : "M",
    calendar: r.calendar === "lunar" ? "lunar" : "solar",
    leapMonth: r.leapMonth === true,
    year: int(r.year),
    month: int(r.month),
    day: int(r.day),
    hour: r.hour == null ? null : int(r.hour),
    minute: r.minute == null ? null : int(r.minute),
    solarTimeCorrection: r.solarTimeCorrection !== false,
  };
  if (!(input.year >= 1920 && input.year <= 2030)) throw new Error("출생 연도는 1920~2030년 사이여야 합니다.");
  if (!(input.month >= 1 && input.month <= 12)) throw new Error("월이 올바르지 않습니다.");
  if (!(input.day >= 1 && input.day <= 31)) throw new Error("일이 올바르지 않습니다.");
  if (input.hour !== null && !(input.hour >= 0 && input.hour <= 23)) throw new Error("시간이 올바르지 않습니다.");
  if (input.hour === null) input.minute = null;
  else if (!(input.minute !== null && input.minute >= 0 && input.minute <= 59)) input.minute = 0;
  if (input.calendar === "solar") input.leapMonth = false;
  return input;
}

export function calculateSaju(input: SajuInput, now = new Date()): SajuChart {
  const timeKnown = input.hour !== null;
  const h = input.hour ?? 12;
  const mi = input.minute ?? 0;

  let solar: Solar;
  if (input.calendar === "lunar") {
    // lunar-javascript는 윤달을 음수 월로 표현하고, 존재하지 않는 음력 날짜면 예외를 던진다.
    try {
      solar = Lunar.fromYmdHms(input.year, input.leapMonth ? -input.month : input.month, input.day, h, mi, 0).getSolar();
    } catch {
      throw new Error(input.leapMonth ? "해당 연도에 그 윤달이 없습니다." : "존재하지 않는 음력 날짜입니다.");
    }
    solar = Solar.fromYmdHms(solar.getYear(), solar.getMonth(), solar.getDay(), h, mi, 0);
  } else {
    // lunar-javascript는 2월 30일 같은 날짜도 그대로 받으므로 직접 검증한다.
    if (new Date(Date.UTC(input.year, input.month - 1, input.day)).getUTCDate() !== input.day) {
      throw new Error("존재하지 않는 날짜입니다.");
    }
    solar = Solar.fromYmdHms(input.year, input.month, input.day, h, mi, 0);
  }
  const solarDate = solar.toYmd();

  const corrections: string[] = [];
  if (timeKnown && input.solarTimeCorrection) {
    const ymd = solar.toYmd();
    if (KOREA_DST.some(([s, e]) => ymd >= s && ymd < e)) {
      solar = shiftMinutes(solar, -60);
      corrections.push("서머타임 -60분");
    }
    const lon = longitudeCorrectionMinutes(ymd);
    if (lon !== 0) {
      solar = shiftMinutes(solar, lon);
      corrections.push(`진태양시 ${lon}분`);
    }
  }

  const lunar = solar.getLunar();
  const ec: EightChar = lunar.getEightChar();
  ec.setSect(1);

  const pillars: Pillar[] = [];
  if (timeKnown) {
    pillars.push(buildPillar("시주", ec.getTimeGan(), ec.getTimeZhi(), ec.getTimeShiShenGan(), ec.getTimeShiShenZhi(), ec.getTimeHideGan()));
  }
  pillars.push(buildPillar("일주", ec.getDayGan(), ec.getDayZhi(), ec.getDayShiShenGan(), ec.getDayShiShenZhi(), ec.getDayHideGan()));
  pillars.push(buildPillar("월주", ec.getMonthGan(), ec.getMonthZhi(), ec.getMonthShiShenGan(), ec.getMonthShiShenZhi(), ec.getMonthHideGan()));
  pillars.push(buildPillar("연주", ec.getYearGan(), ec.getYearZhi(), ec.getYearShiShenGan(), ec.getYearShiShenZhi(), ec.getYearHideGan()));

  const elementCounts: Record<Element, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const p of pillars) {
    elementCounts[p.ganElement]++;
    elementCounts[p.zhiElement]++;
  }

  const yun = ec.getYun(input.gender === "M" ? 1 : 0);
  const daeun = yun
    .getDaYun()
    .filter((d) => d.getGanZhi())
    .slice(0, 9)
    .map((d) => ({ startAge: d.getStartAge(), startYear: d.getStartYear(), ganZhi: d.getGanZhi(), ko: koGanZhi(d.getGanZhi()) }));

  const yearOf = (y: number) => {
    const gz = Solar.fromYmd(y, 6, 1).getLunar().getYearInGanZhiByLiChun();
    return { year: y, ganZhi: gz, ko: koGanZhi(gz) };
  };
  const currentYear = now.getFullYear();
  const dayGan = ec.getDayGan();

  return {
    pillars,
    dayMaster: { gan: dayGan, ko: GAN_KO[dayGan], element: GAN_ELEMENT[dayGan], yinYang: YANG_GAN.has(dayGan) ? "양" : "음" },
    elementCounts,
    zodiac: ZODIAC[ec.getYearZhi()],
    daeun,
    daeunStartAge: daeun[0]?.startAge ?? 0,
    solarDate,
    lunarDate: `${lunar.getYear()}년 ${lunar.getMonth() < 0 ? "윤" : ""}${Math.abs(lunar.getMonth())}월 ${lunar.getDay()}일`,
    usedTime: timeKnown ? `${pad(solar.getHour())}:${pad(solar.getMinute())}` : null,
    corrections,
    thisYear: yearOf(currentYear),
    nextYear: yearOf(currentYear + 1),
  };
}

/** 일간별 무료 요약 문구 */
export const DAY_MASTER_SUMMARY: Record<string, { title: string; text: string }> = {
  甲: { title: "곧게 뻗은 큰 나무", text: "목표가 정해지면 흔들림 없이 위로 자라는 사람입니다. 리더십과 개척 정신이 강하고, 자존심이 높아 굽히기보다 부러지는 쪽을 택하기도 합니다." },
  乙: { title: "바람에 유연한 풀과 덩굴", text: "부드럽지만 끈질긴 생명력을 지녔습니다. 환경에 맞춰 길을 찾는 적응력과 친화력이 뛰어나고, 사람 사이의 흐름을 잘 읽습니다." },
  丙: { title: "하늘의 태양", text: "밝고 솔직하며 존재만으로 주변을 환하게 만드는 사람입니다. 열정과 표현력이 강하고, 숨기는 것을 어려워합니다." },
  丁: { title: "어둠을 밝히는 촛불", text: "따뜻하고 섬세한 집중력의 소유자입니다. 겉으로는 조용해도 속에는 꺼지지 않는 열정이 있고, 한 사람 한 사람을 깊이 챙깁니다." },
  戊: { title: "넓고 듬직한 산", text: "믿음직하고 포용력이 큰 사람입니다. 쉽게 흔들리지 않는 중심이 있고, 주변 사람들이 기대고 싶어 하는 안정감을 줍니다." },
  己: { title: "곡식을 키우는 밭", text: "현실 감각이 좋고 실속을 챙길 줄 압니다. 사람과 일을 길러내는 능력이 있으며, 겉보다 속이 단단한 사람입니다." },
  庚: { title: "단단한 원석과 바위", text: "결단력과 의리가 강한 사람입니다. 옳고 그름이 분명하고 추진력이 있어, 다듬어질수록 크게 빛나는 원석과 같습니다." },
  辛: { title: "빛나는 보석", text: "예리한 감각과 높은 기준을 지녔습니다. 섬세하고 깔끔한 것을 좋아하며, 자신만의 품위를 지키려는 마음이 강합니다." },
  壬: { title: "넓게 흐르는 바다와 큰 강", text: "생각의 스케일이 크고 지혜로운 사람입니다. 자유로운 흐름을 좋아하며, 많은 것을 품고 받아들이는 포용력이 있습니다." },
  癸: { title: "만물을 적시는 비와 이슬", text: "직관과 감수성이 뛰어난 사람입니다. 조용히 스며들어 주변을 변화시키는 힘이 있고, 생각이 깊고 아이디어가 풍부합니다." },
};
