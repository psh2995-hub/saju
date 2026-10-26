import { createHash, randomInt } from "node:crypto";

/** 010-1234-5678 같은 입력을 01012345678로 바꾼다. 휴대전화 번호가 아니면 null. */
export function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  return /^01[016789]\d{7,8}$/.test(digits) ? digits : null;
}

export function newVerificationCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCode(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}
