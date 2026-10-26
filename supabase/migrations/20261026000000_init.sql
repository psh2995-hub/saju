-- 풀이(사주/타로) 1건 = readings 1행. 결제 전에도 생성되며 무료 요약을 담는다.
create table public.readings (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('saju', 'tarot')),
  input jsonb not null,
  chart jsonb not null,
  price integer not null check (price >= 0),
  status text not null default 'unpaid' check (status in ('unpaid', 'paid', 'refunded')),
  payment_id text unique,
  paid_at timestamptz,
  ai_status text not null default 'none' check (ai_status in ('none', 'generating', 'done', 'failed')),
  ai_started_at timestamptz,
  ai_result text,
  created_at timestamptz not null default now()
);

-- 포트원 결제 조회 결과 원본 보관 (검증·분쟁 대응용)
create table public.payments (
  payment_id text primary key,
  reading_id uuid not null references public.readings(id) on delete cascade,
  amount integer not null,
  status text not null,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_reading_id_idx on public.payments(reading_id);

-- 모든 접근은 서버(secret key)에서만 한다. 정책을 만들지 않으므로 anon/authenticated는 접근 불가.
alter table public.readings enable row level security;
alter table public.payments enable row level security;

-- AI 풀이 생성 권한을 원자적으로 획득한다. 동시 요청 중 하나만 true를 받는다.
create or replace function public.claim_ai_generation(p_id uuid)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  with claimed as (
    update public.readings
       set ai_status = 'generating', ai_started_at = now()
     where id = p_id
       and status = 'paid'
       and (ai_status in ('none', 'failed')
            or (ai_status = 'generating' and ai_started_at < now() - interval '5 minutes'))
    returning 1
  )
  select exists (select 1 from claimed);
$$;

revoke execute on function public.claim_ai_generation(uuid) from public, anon, authenticated;
grant execute on function public.claim_ai_generation(uuid) to service_role;
