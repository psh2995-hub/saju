import * as Astronomy from "astronomy-engine";
import { SIGNS, type SignKey } from "./zodiac-signs";

// 서양 점성술(트로피컬)의 행성 위치. astronomy-engine으로 그 시점의 황경(진춘분점 기준)을 구한다.

export type PlanetKey = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn";

const BODY: Record<PlanetKey, Astronomy.Body> = {
  sun: Astronomy.Body.Sun,
  moon: Astronomy.Body.Moon,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
};

const norm = (deg: number) => ((deg % 360) + 360) % 360;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** 지구에서 본 황경(0~360도, 그 시점의 황도·춘분점 기준) */
export function eclipticLongitude(planet: PlanetKey, date: Date): number {
  if (planet === "sun") return norm(Astronomy.SunPosition(date).elon);
  if (planet === "moon") return norm(Astronomy.EclipticGeoMoon(date).lon);
  const v = Astronomy.GeoVector(BODY[planet], date, true);
  return norm(Astronomy.SphereFromVector(Astronomy.RotateVector(Astronomy.Rotation_EQJ_ECT(date), v)).lon);
}

/** 상승궁(동쪽 지평선에 떠오르는 황도 위의 점)의 황경 */
export function ascendant(date: Date, lat: number, lon: number): number {
  const ramc = rad(norm(Astronomy.SiderealTime(date) * 15 + lon));
  const t = Astronomy.MakeTime(date).tt / 36525;
  const eps = rad(23.439291 - 0.0130042 * t);
  return norm((Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(rad(lat)) * Math.sin(eps))) * 180) / Math.PI);
}

export function signOf(longitude: number): { sign: SignKey; degree: number } {
  return { sign: SIGNS[Math.floor(longitude / 30)].key, degree: Math.floor(longitude % 30) };
}
