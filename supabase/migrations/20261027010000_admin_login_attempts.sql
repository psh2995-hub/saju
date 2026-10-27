-- 관리자 로그인 시도 기록. 무차별 대입 제한과 로그인 이력 확인에 쓴다.
-- RLS를 켜고 정책을 두지 않아 서버 secret key로만 접근한다.
create table public.admin_login_attempts (
  id bigint generated always as identity primary key,
  ip text not null,
  ok boolean not null,
  -- 실패 이유(password, otp, locked)
  reason text,
  -- 성공한 OTP의 30초 구간 번호. 같은 코드를 다시 쓰지 못하게 한다.
  totp_step bigint,
  user_agent text,
  created_at timestamptz not null default now()
);

create index admin_login_attempts_created_at on public.admin_login_attempts (created_at desc);
create index admin_login_attempts_ip_created_at on public.admin_login_attempts (ip, created_at desc);

alter table public.admin_login_attempts enable row level security;
