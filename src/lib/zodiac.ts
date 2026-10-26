import { Lunar, Solar } from "lunar-javascript";
import { ascendant, eclipticLongitude, signOf, type PlanetKey } from "./astro";
import { ANIMAL_TRAIT_EN, kSign } from "./en";
import { placeById } from "./places";
import { isValidTimeZone, zonedWallClockToUtc } from "./saju";
import { SIGNS, type SignKey } from "./zodiac-signs";

/** 별자리(서양 점성술) 풀이. 출생 시각과 출생 도시가 있으면 달·상승궁까지 정확해진다. */
export type ZodiacInput = {
  name?: string;
  /** 음력으로 입력했다면 그 원래 값. year·month·day는 양력으로 바꾼 값이다. */
  lunar?: { year: number; month: number; day: number; leapMonth: boolean };
  year: number;
  month: number;
  day: number;
  /** 모르면 null */
  hour: number | null;
  minute: number | null;
  /** 목록에서 고른 출생 도시(places.ts). 없으면 timeZone만 있다. */
  placeId?: string;
  timeZone: string;
};

export type Placement = { point: PlanetKey | "rising"; sign: SignKey; degree: number };

export type ZodiacChart = {
  /** 태양·달·(상승궁)·수성·금성·화성 */
  placements: Placement[];
  /** 출생 시각을 몰라 정오로 계산했고, 그날 달이 별자리를 옮겼다 */
  moonUncertain: boolean;
  place: string | null;
  elements: Record<"Fire" | "Earth" | "Air" | "Water", number>;
  /** 입춘 기준 한국 띠 */
  animal: { ganZhi: string; name: string; trait: string };
  /** 풀이를 만든 날의 목성·토성 별자리(앞으로 1년의 흐름을 읽을 때 쓴다) */
  sky: { date: string; jupiter: SignKey; saturn: SignKey };
};

const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) ? v : NaN);

export function validateZodiacInput(raw: unknown): ZodiacInput {
  const r = raw as Record<string, unknown>;
  let [year, month, day] = [int(r.year), int(r.month), int(r.day)];
  if (!(year >= 1920 && year <= 2030)) throw new Error("출생 연도는 1920~2030년 사이여야 합니다.");
  let lunar: ZodiacInput["lunar"];
  if (r.calendar === "lunar") {
    const leapMonth = r.leapMonth === true;
    if (!(month >= 1 && month <= 12 && day >= 1 && day <= 30)) throw new Error("존재하지 않는 음력 날짜입니다.");
    // lunar-javascript는 윤달을 음수 월로 표현하고, 존재하지 않는 음력 날짜면 예외를 던진다.
    try {
      const solar = Lunar.fromYmdHms(year, leapMonth ? -month : month, day, 12, 0, 0).getSolar();
      lunar = { year, month, day, leapMonth };
      [year, month, day] = [solar.getYear(), solar.getMonth(), solar.getDay()];
    } catch {
      throw new Error(leapMonth ? "해당 연도에 그 윤달이 없습니다." : "존재하지 않는 음력 날짜입니다.");
    }
  } else if (!(month >= 1 && month <= 12) || new Date(Date.UTC(year, month - 1, day)).getUTCDate() !== day) {
    throw new Error("존재하지 않는 날짜입니다.");
  }
  const hour = r.hour == null ? null : int(r.hour);
  if (hour !== null && !(hour >= 0 && hour <= 23)) throw new Error("시간이 올바르지 않습니다.");
  const minute = hour === null ? null : int(r.minute) >= 0 && int(r.minute) <= 59 ? int(r.minute) : 0;

  const place = placeById(r.placeId);
  const timeZone = place?.timeZone ?? (typeof r.timeZone === "string" ? r.timeZone : "");
  if (!timeZone || timeZone.length > 64 || !isValidTimeZone(timeZone)) throw new Error("출생지 시간대가 올바르지 않습니다.");

  const name = typeof r.name === "string" ? r.name.trim().slice(0, 20) : undefined;
  return { name, ...(lunar ? { lunar } : {}), year, month, day, hour, minute, ...(place ? { placeId: place.id } : {}), timeZone };
}

const birthUtc = (input: ZodiacInput, h: number, mi: number) =>
  new Date(zonedWallClockToUtc(Solar.fromYmdHms(input.year, input.month, input.day, h, mi, 0), input.timeZone));

export function calculateZodiac(input: ZodiacInput, now = new Date()): ZodiacChart {
  const timeKnown = input.hour !== null;
  const birth = birthUtc(input, input.hour ?? 12, input.minute ?? 0);
  const place = placeById(input.placeId);

  const at = (point: PlanetKey) => ({ point, ...signOf(eclipticLongitude(point, birth)) });
  const placements: Placement[] = [at("sun"), at("moon")];
  if (timeKnown && place) placements.push({ point: "rising", ...signOf(ascendant(birth, place.lat, place.lon)) });
  placements.push(at("mercury"), at("venus"), at("mars"));

  const moonSign = (h: number, mi: number) => signOf(eclipticLongitude("moon", birthUtc(input, h, mi))).sign;
  const moonUncertain = !timeKnown && moonSign(0, 0) !== moonSign(23, 59);

  const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  for (const p of placements) elements[SIGNS.find((s) => s.key === p.sign)!.element]++;

  // 띠는 입춘 기준. 시각을 모르면 정오로 본다.
  const ganZhi = Solar.fromYmdHms(input.year, input.month, input.day, input.hour ?? 12, input.minute ?? 0, 0).getLunar().getYearInGanZhiByLiChun();

  return {
    placements,
    moonUncertain,
    place: place?.label ?? null,
    elements,
    animal: { ganZhi, name: kSign(ganZhi), trait: ANIMAL_TRAIT_EN[ganZhi[1]] },
    sky: {
      date: now.toISOString().slice(0, 10),
      jupiter: signOf(eclipticLongitude("jupiter", now)).sign,
      saturn: signOf(eclipticLongitude("saturn", now)).sign,
    },
  };
}
