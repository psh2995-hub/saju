# 사주·타로 유료 풀이 서비스

Next.js 16(App Router) + Supabase + 포트원 V2 + Claude API로 만든 사주·타로 웹서비스입니다.

## 흐름

1. `/saju` 또는 `/tarot`에서 정보를 입력하면 `POST /api/readings`가 명식 계산(만세력) 또는 카드 뽑기를 하고 `readings` 행을 만듭니다.
2. `/r/[id]`에서 무료 결과(명식·오행·대운 / 카드 의미)를 보여 주고, 결제 버튼을 띄웁니다.
3. 결제가 끝나면 브라우저가 `POST /api/payments/complete`를 부르고, 서버가 포트원에 결제 건을 직접 조회해 금액·상태를 검증한 뒤 `paid`로 바꿉니다. 웹훅(`/api/payments/webhook`)도 같은 검증 함수를 씁니다.
4. `POST /api/readings/[id]/generate`가 Claude로 풀이를 스트리밍하고, 끝나면 DB에 저장합니다. 같은 풀이는 다시 생성하지 않습니다.

회원가입은 없고, 결과 페이지 주소(추측 불가능한 UUID)가 열람 권한입니다.

## 상품

| 상품 | 무료로 보여 주는 것 | 유료(AI) |
|---|---|---|
| 사주 (`/saju`) | 명식, 일주(60일주 요약), 오행, 대운 | 정밀 풀이 |
| 궁합 (`/gunghap`) | 두 사람 명식, 천간합·일지 합충·띠·오행 보완 포인트 | 궁합 풀이 |
| 신년운세 (`/newyear`) | 다가오는 해의 세운 십성, 월운 12개월 | 월별 풀이 (10월부터 다음 해) |
| 타로 (`/tarot`) | 카드 3장과 의미 | 심층 해석 |
| 추가 질문 | — | 결제한 풀이에 이어서 1회 질문 |
| 오늘의 운세 (`/today`) | 일진 × 일간 운세 (하루 최대 10건 생성 후 캐시) | 알림톡 구독은 무료 |

공유: 결과 페이지의 "결과 공유하기"는 `/s/{share_id}`(무료 요약만, 개인 정보 없음)를 공유하고, 링크 미리보기와 "이미지 저장"은 `/api/share-image/{share_id}`가 만듭니다.

## 구조

| 경로 | 내용 |
|---|---|
| `src/lib/saju.ts` | 만세력 계산(lunar-javascript), 진태양시·서머타임 보정, 십성·지장간·대운 |
| `src/lib/tarot*.ts` | 78장 카드 데이터, 서버 측 셔플 |
| `src/lib/ai.ts` | Claude 프롬프트와 스트리밍 |
| `src/lib/payments.ts` | 포트원 결제 검증(완료 콜백·웹훅 공용) |
| `src/lib/products.ts` | 상품명·가격 |
| `src/lib/site.ts` | 상호명·사업자 정보(환경 변수) |
| `supabase/migrations/` | DB 스키마 (RLS 켜짐, 정책 없음 → 서버 secret key로만 접근) |

## 타로 카드 이미지

`public/tarot/*.webp`는 1909년 라이더-웨이트-스미스 덱(그림: 패멀라 콜먼 스미스, 1951년 사망) 스캔으로, 저작권 보호기간이 끝난 공개 도메인 이미지입니다. 스캔은 [metabismuth/tarot-json](https://github.com/metabismuth/tarot-json)(출처 data.totl.net)에서 받아 WebP로 변환했습니다. 1971년 이후 U.S. Games Systems가 다시 채색한 판은 별도 저작권이 있으니 섞어 쓰지 마세요.

## 로컬 실행

```bash
cp .env.example .env.local   # 값 채우기
npm install
npm run dev
```

포트원 키 없이 전체 흐름을 시험하려면 `ALLOW_MOCK_PAYMENT=true`로 두세요. 결제 버튼이 가짜 결제로 동작합니다. **운영 환경에서는 반드시 끄세요.**

## 매일 운세 알림톡

1. [솔라피](https://solapi.com) 가입 → API 키 발급, 발신번호 등록
2. 카카오톡 채널 개설 → 솔라피에 채널 연동(pfId 확인)
3. 솔라피에서 알림톡 템플릿 등록·검수 요청. 변수 이름은 코드(`src/app/api/cron/daily/route.ts`)와 같아야 합니다. 예시:

```
[운명다방] 오늘의 운세

#{날짜} #{일진}일
#{일간} 일간인 당신의 오늘: #{요약}

자세한 운세 보기: #{링크}

※ 매일 운세 구독을 신청하신 분께 발송됩니다.
수신 거부: #{수신거부}
```

4. Vercel 환경 변수에 `SOLAPI_*`, `KAKAO_*`, `CRON_SECRET` 입력 후 재배포. `vercel.json`의 cron이 매일 한국 시간 08:00에 `/api/cron/daily`를 호출합니다.

## 오픈 전 남은 일

- [x] Vercel 환경 변수에 `SUPABASE_SECRET_KEY`, `ANTHROPIC_API_KEY` 입력
- [ ] PG 심사 통과 후 포트원 스토어 ID·채널 키·API 시크릿·웹훅 시크릿 입력, 웹훅 URL 등록
- [ ] 사업자 정보(`NEXT_PUBLIC_BIZ_*`) 입력
- [ ] 약관·환불정책·개인정보처리방침 법률 검토
- [ ] 1년 지난 풀이 자동 파기(개인정보처리방침에 명시) — Supabase pg_cron 등으로 구현 필요
- [ ] `POST /api/readings` 요청 횟수 제한(봇 방지)
- [ ] 알림톡 템플릿 검수 후 실제 발송 테스트 (솔라피 연동 코드는 아직 실제 키로 시험하지 못함)
- [ ] 인증번호 문자 전체 발송량 제한 (지금은 번호별 1분 1회만 막음, 문자 비용 남용 방지)
