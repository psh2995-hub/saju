# 사주·타로 유료 풀이 서비스

Next.js 16(App Router) + Supabase + 포트원 V2 + Claude API로 만든 사주·타로 웹서비스입니다.

## 흐름

1. `/saju` 또는 `/tarot`에서 정보를 입력하면 `POST /api/readings`가 명식 계산(만세력) 또는 카드 뽑기를 하고 `readings` 행을 만듭니다.
2. `/r/[id]`에서 무료 결과(명식·오행·대운 / 카드 의미)를 보여 주고, 결제 버튼을 띄웁니다.
3. 결제가 끝나면 브라우저가 `POST /api/payments/complete`를 부르고, 서버가 포트원에 결제 건을 직접 조회해 금액·상태를 검증한 뒤 `paid`로 바꿉니다. 웹훅(`/api/payments/webhook`)도 같은 검증 함수를 씁니다.
4. `POST /api/readings/[id]/generate`가 Claude로 풀이를 스트리밍하고, 끝나면 DB에 저장합니다. 같은 풀이는 다시 생성하지 않습니다.

회원가입은 없고, 결과 페이지 주소(추측 불가능한 UUID)가 열람 권한입니다.

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

## 로컬 실행

```bash
cp .env.example .env.local   # 값 채우기
npm install
npm run dev
```

포트원 키 없이 전체 흐름을 시험하려면 `ALLOW_MOCK_PAYMENT=true`로 두세요. 결제 버튼이 가짜 결제로 동작합니다. **운영 환경에서는 반드시 끄세요.**

## 오픈 전 남은 일

- [ ] Vercel 환경 변수에 `SUPABASE_SECRET_KEY`, `ANTHROPIC_API_KEY` 입력
- [ ] PG 심사 통과 후 포트원 스토어 ID·채널 키·API 시크릿·웹훅 시크릿 입력, 웹훅 URL 등록
- [ ] 사업자 정보(`NEXT_PUBLIC_BIZ_*`) 입력, 상호명 확정 시 `NEXT_PUBLIC_SITE_NAME` 변경
- [ ] 약관·환불정책·개인정보처리방침 법률 검토
- [ ] 1년 지난 풀이 자동 파기(개인정보처리방침에 명시) — Supabase pg_cron 등으로 구현 필요
- [ ] `POST /api/readings` 요청 횟수 제한(봇 방지)
