import "server-only";
import { SolapiMessageService } from "solapi";
import { SITE_NAME } from "./site";

/**
 * 솔라피(Solapi)로 인증번호 문자와 카카오 알림톡을 보낸다.
 * 필요한 환경 변수: SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER(사전 등록 발신번호),
 * KAKAO_PFID(카카오 채널 연동 ID), KAKAO_DAILY_TEMPLATE_ID(검수 완료된 알림톡 템플릿 ID)
 */
export function messagingConfigured() {
  return Boolean(
    process.env.SOLAPI_API_KEY &&
      process.env.SOLAPI_API_SECRET &&
      process.env.SOLAPI_SENDER &&
      process.env.KAKAO_PFID &&
      process.env.KAKAO_DAILY_TEMPLATE_ID,
  );
}

function service() {
  return new SolapiMessageService(process.env.SOLAPI_API_KEY!, process.env.SOLAPI_API_SECRET!);
}

export async function sendVerificationSms(phone: string, code: string) {
  await service().send({ to: phone, from: process.env.SOLAPI_SENDER!, text: `[${SITE_NAME}] 인증번호 ${code}를 입력해 주세요. (5분간 유효)` });
}

export type DailyAlimtalk = { phone: string; variables: Record<string, string> };

/**
 * 매일 운세 알림톡. 변수 이름은 솔라피에 등록·검수받은 템플릿과 정확히 같아야 한다.
 * 템플릿 예시는 README의 "매일 운세 알림톡" 절을 참고한다.
 */
export async function sendDailyAlimtalks(messages: DailyAlimtalk[]) {
  if (!messages.length) return;
  await service().send(
    messages.map((m) => ({
      to: m.phone,
      from: process.env.SOLAPI_SENDER!,
      kakaoOptions: { pfId: process.env.KAKAO_PFID!, templateId: process.env.KAKAO_DAILY_TEMPLATE_ID!, variables: m.variables },
    })),
  );
}
