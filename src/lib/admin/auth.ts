import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { db } from "../supabase";
import { base32Encode, verifyTotp } from "./totp";

/**
 * 관리자 인증. 관리자 화면은 ADMIN_HOST 도메인에서만 열리고(proxy.ts에서도 막는다),
 * 비밀번호 + OTP(ADMIN_TOTP_SECRET을 넣은 뒤) 로그인 후 서명한 세션 쿠키로 확인한다.
 */

// __Host- 접두사: HTTPS, Path=/, Domain 없음일 때만 브라우저가 저장한다.
export const SESSION_COOKIE = "__Host-admin_session";
export const SESSION_HOURS = 12;

const MAX_FAILS_PER_IP = 5;
const MAX_FAILS_TOTAL = 20;
const FAIL_WINDOW_MINUTES = 15;

export function adminConfig() {
  const host = process.env.ADMIN_HOST?.trim().toLowerCase() || null;
  const password = process.env.ADMIN_PASSWORD ?? "";
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "";
  const totpSecret = process.env.ADMIN_TOTP_SECRET?.replace(/\s/g, "") || null;
  const allowedIps = (process.env.ADMIN_ALLOWED_IPS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const problems = [
    !host && "ADMIN_HOST",
    password.length < 12 && "ADMIN_PASSWORD(12자 이상)",
    sessionSecret.length < 32 && "ADMIN_SESSION_SECRET(32자 이상)",
  ].filter((p): p is string => !!p);
  return { host, password, sessionSecret, totpSecret, allowedIps, problems };
}

/** Vercel이 넣어 주는 접속 IP. Vercel은 이 헤더를 덮어써서 클라이언트가 위조할 수 없다. */
export function clientIp(h: Headers) {
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** 관리자 도메인과 IP 허용 목록을 확인한다. */
export function requestAllowed(h: Headers) {
  const cfg = adminConfig();
  if (!cfg.host || h.get("host")?.toLowerCase() !== cfg.host) return false;
  return cfg.allowedIps.length === 0 || cfg.allowedIps.includes(clientIp(h));
}

/** 폼 POST가 관리자 도메인에서 온 것인지 확인한다(CSRF 방지, SameSite=Strict 쿠키와 함께). */
export function sameOrigin(h: Headers) {
  const origin = h.get("origin");
  const host = adminConfig().host;
  return !!origin && !!host && new URL(origin).host.toLowerCase() === host;
}

const sha256 = (s: string) => createHash("sha256").update(s).digest();

/** 비밀번호나 OTP 비밀값을 바꾸면 기존 세션이 모두 무효가 되도록 서명 키에 함께 넣는다. */
function signingKey() {
  const cfg = adminConfig();
  return createHmac("sha256", cfg.sessionSecret).update(`v1:${sha256(cfg.password).toString("hex")}:${cfg.totpSecret ?? ""}`).digest();
}

const sign = (payload: string) => createHmac("sha256", signingKey()).update(payload).digest("base64url");

export function createSessionToken(now = Date.now()) {
  const payload = `${now + SESSION_HOURS * 3600_000}.${randomBytes(12).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

function validToken(token: string | undefined, now = Date.now()) {
  if (!token || adminConfig().problems.length) return false;
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const sig = Buffer.from(token.slice(i + 1));
  const expected = Buffer.from(sign(payload));
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) return false;
  return Number(payload.split(".")[0]) > now;
}

/**
 * 관리자 화면(Server Component)의 첫 줄에서 부른다. 관리자 도메인이 아니면 404, 로그인하지 않았으면 로그인 화면으로 보낸다.
 * proxy.ts가 막더라도 화면마다 다시 확인한다.
 */
export async function requireAdmin() {
  // 요청마다 렌더링한다(세션 만료 확인에 현재 시각을 쓴다).
  await connection();
  const h = await headers();
  if (!requestAllowed(h)) notFound();
  if (!validToken((await cookies()).get(SESSION_COOKIE)?.value)) redirect("/admin/login");
}

/** Route Handler용: 도메인·IP·세션을 모두 확인한다. */
export async function isAdminRequest(request: Request) {
  if (!requestAllowed(request.headers)) return false;
  return validToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function hasValidSession() {
  await connection();
  return validToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export function checkPassword(input: string) {
  return timingSafeEqual(sha256(input), sha256(adminConfig().password));
}

type LoginResult = { ok: true } | { ok: false; reason: "locked" | "password" | "otp" };

/** 비밀번호·OTP를 확인하고 결과를 기록한다. 최근 15분 실패가 IP당 5회, 전체 20회를 넘으면 잠근다. */
export async function attemptLogin(h: Headers, password: string, otp: string): Promise<LoginResult> {
  const cfg = adminConfig();
  const ip = clientIp(h);
  const since = new Date(Date.now() - FAIL_WINDOW_MINUTES * 60_000).toISOString();
  const recent = await db().from("admin_login_attempts").select("ip").eq("ok", false).gte("created_at", since);
  if (recent.error) throw recent.error;
  const fails = recent.data ?? [];
  const record = (ok: boolean, reason: string | null, totpStep: number | null = null) =>
    db().from("admin_login_attempts").insert({ ip, ok, reason, totp_step: totpStep, user_agent: h.get("user-agent")?.slice(0, 300) ?? null });

  if (fails.filter((f) => f.ip === ip).length >= MAX_FAILS_PER_IP || fails.length >= MAX_FAILS_TOTAL) {
    await record(false, "locked");
    return { ok: false, reason: "locked" };
  }
  if (!checkPassword(password)) {
    await record(false, "password");
    return { ok: false, reason: "password" };
  }
  let step: number | null = null;
  if (cfg.totpSecret) {
    step = verifyTotp(cfg.totpSecret, otp.trim());
    // 이미 로그인에 쓴 코드는 다시 받지 않는다(재전송 공격 방지).
    const used = step === null ? null : await db().from("admin_login_attempts").select("id").eq("ok", true).gte("totp_step", step).limit(1);
    if (step === null || (used?.data?.length ?? 0) > 0) {
      await record(false, "otp");
      return { ok: false, reason: "otp" };
    }
  }
  await record(true, null, step);
  return { ok: true };
}

/** OTP 설정 화면에 보여 줄 비밀값. 세션 비밀값에서 만들어 화면을 새로 열어도 바뀌지 않는다. */
export function suggestedTotpSecret() {
  return base32Encode(createHmac("sha256", adminConfig().sessionSecret).update("totp-setup-v1").digest().subarray(0, 20));
}

export function sessionCookieOptions(maxAgeSeconds: number) {
  return { httpOnly: true, secure: true, sameSite: "strict" as const, path: "/", maxAge: maxAgeSeconds };
}
