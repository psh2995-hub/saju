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

## 해외(영문) 페이지 `/en`

해외 방문자에게는 서양 별자리에 익숙하다는 점을 살려 **별자리(Zodiac)**를 맨 앞에, **타로**를 그다음에 두고, 사주는 "K-Zodiac"(한국식 별자리) 느낌으로 소개합니다.

| 상품 | 무료로 보여 주는 것 | 유료(AI, 영어) |
|---|---|---|
| Zodiac (`/en/zodiac`, 영문 전용 `zodiac`) | 태양·달·상승궁, 수성·금성·화성의 별자리(출생 시각·도시 기준 실제 천체 위치), 4원소 분포, 한국 띠 | 빅3·연애·일과 돈·원소·앞으로 1년(현재 목성·토성 위치) 풀이 |
| Tarot (`/en/tarot`, `tarot`) | 카드 3장과 영문 의미 | 영문 심층 해석 |
| K-Zodiac Forecast (`/en/forecast`, `newyear`) | 그해 이름(예: Year of the Red Sheep), 세운 십성, 월운 | 월별 영문 운세 |
| Korean Birth Chart (`/en/saju`, `saju`) | 사주 명식, 일주를 "Yin Metal Pig" 같은 한국식 탄생 사인으로, 오행, 대운 | 영문 정밀 풀이 |

- 별자리 계산은 `astronomy-engine`(MIT)으로 출생 시점의 황경(트로피컬)을 구하고, 상승궁은 출생 도시 좌표(`src/lib/places.ts`)로 계산합니다. 시간을 모르면 정오로 계산하고 상승궁은 보여 주지 않으며, 그날 달이 별자리를 옮겼으면 달 별자리가 불확실하다고 표시합니다.
- 영문 상품의 달러 가격은 `src/lib/products.ts`의 `PRICES_USD`(센트)입니다: Zodiac $4, Tarot $3, K-Zodiac Forecast $7, Korean Birth Chart $7, 추가 질문 $2.
- **달러 결제(토스페이먼츠)**: `NEXT_PUBLIC_PORTONE_CHANNEL_KEY_USD`에 포트원의 토스페이먼츠 USD 채널 키를 넣으면, 그 뒤 만들어지는 영문 풀이는 달러(센트 단위)로 저장되고 해외 발급 카드로만 결제됩니다(`bypass.tosspayments.useInternationalCardOnly`). 비워 두면 원화로 결제하고, 화면에는 1달러 = 1,400원으로 반올림한 달러를 보여 줍니다. 결제 검증은 풀이·추가 질문에 저장된 통화(`currency`)와 금액을 포트원 응답과 비교합니다.
- `src/proxy.ts`: 첫 화면(`/`)에서 접속 국가(`x-vercel-ip-country`)가 한국이 아니고 브라우저 언어가 한국어가 아니면 `/en`으로 보냅니다. 상단의 `EN` / `한국어` 링크로 고른 언어는 `lang` 쿠키에 1년간 기억합니다. 다른 주소(결과·공유 링크)는 건드리지 않습니다.
- `readings.lang`에 풀이 언어를 저장하고, AI 프롬프트와 결과 페이지(`/r/[id]` ↔ `/en/r/[id]`)가 이를 따릅니다.
- 해외 출생자는 출생지 시간대(IANA, 예: `America/New_York`)를 받아 출생지 시계 기준으로 일·시주를 세우고, 연·월주와 대운수는 같은 시점의 UTC로 계산합니다(한국 경도·서머타임 보정은 한국 출생에만 적용).
- 토스페이먼츠는 통화별로 MID가 따로 필요합니다(USD용 MID를 받아 포트원에 채널로 추가). PayPal은 별도 신청이며 아직 연동하지 않았습니다.
- 약관·환불정책·개인정보처리방침은 아직 한국어만 있습니다.

공유: 결과 페이지의 "결과 공유하기"는 `/s/{share_id}`(무료 요약만, 개인 정보 없음)를 공유하고, 링크 미리보기와 "이미지 저장"은 `/api/share-image/{share_id}`가 만듭니다.

## 구조

| 경로 | 내용 |
|---|---|
| `src/lib/saju.ts` | 만세력 계산(lunar-javascript), 진태양시·서머타임 보정, 출생지 시간대, 십성·지장간·대운 |
| `src/lib/i18n.ts`, `src/lib/en.ts` | 언어 설정, 영문 화면 문구, 사주 용어 영문 표 |
| `src/lib/zodiac*.ts`, `src/lib/astro.ts`, `src/lib/places.ts` | 서양 별자리 풀이, 천체 위치·상승궁 계산, 출생 도시 목록 |
| `src/app/(ko)`, `src/app/(en)/en` | 한국어·영문 루트 레이아웃(각자 `<html lang>`), 어느 쪽에도 없는 주소는 `global-not-found.tsx` |
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

## 오픈 전 남은 일

- [x] Vercel 환경 변수에 `SUPABASE_SECRET_KEY`, `ANTHROPIC_API_KEY` 입력
- [ ] PG 심사 통과 후 포트원 스토어 ID·채널 키·API 시크릿·웹훅 시크릿 입력, 웹훅 URL 등록
- [ ] 사업자 정보(`NEXT_PUBLIC_BIZ_*`) 입력
- [ ] 약관·환불정책·개인정보처리방침 법률 검토
- [ ] 1년 지난 풀이 자동 파기(개인정보처리방침에 명시) — Supabase pg_cron 등으로 구현 필요
- [ ] `POST /api/readings` 요청 횟수 제한(봇 방지)
