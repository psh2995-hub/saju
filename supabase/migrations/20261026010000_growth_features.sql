-- 궁합·신년운세 상품 추가
alter table public.readings drop constraint readings_kind_check;
alter table public.readings add constraint readings_kind_check check (kind in ('saju', 'tarot', 'gunghap', 'newyear'));

-- 공유용 식별자. 결과 페이지(/r/{id})는 유료 풀이를 열람할 수 있는 열쇠이므로 공유에는 별도 ID를 쓴다.
alter table public.readings add column share_id uuid not null default gen_random_uuid();
create unique index readings_share_id_idx on public.readings(share_id);

-- 추가 질문권: 결제된 풀이에 이어서 묻는 유료 질문
create table public.followups (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid not null references public.readings(id) on delete cascade,
  question text not null check (char_length(question) between 1 and 300),
  price integer not null check (price >= 0),
  status text not null default 'unpaid' check (status in ('unpaid', 'paid', 'refunded')),
  payment_id text unique,
  paid_at timestamptz,
  ai_status text not null default 'none' check (ai_status in ('none', 'generating', 'done', 'failed')),
  ai_started_at timestamptz,
  ai_result text,
  created_at timestamptz not null default now()
);
create index followups_reading_id_idx on public.followups(reading_id, created_at);
alter table public.followups enable row level security;

alter table public.payments add column followup_id uuid references public.followups(id) on delete cascade;

create or replace function public.claim_followup_generation(p_id uuid)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  with claimed as (
    update public.followups
       set ai_status = 'generating', ai_started_at = now()
     where id = p_id
       and status = 'paid'
       and (ai_status in ('none', 'failed')
            or (ai_status = 'generating' and ai_started_at < now() - interval '5 minutes'))
    returning 1
  )
  select exists (select 1 from claimed);
$$;
revoke execute on function public.claim_followup_generation(uuid) from public, anon, authenticated;
grant execute on function public.claim_followup_generation(uuid) to service_role;

-- 매일 운세: (날짜, 일간) 조합마다 한 번만 생성해 캐시한다. 하루 최대 10건.
create table public.daily_fortunes (
  fortune_date date not null,
  day_gan text not null,
  day_ganzhi text not null,
  summary text not null,
  body text not null,
  created_at timestamptz not null default now(),
  primary key (fortune_date, day_gan)
);
alter table public.daily_fortunes enable row level security;

-- 매일 운세 알림톡 구독자
create table public.daily_subscribers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  day_gan text not null,
  verify_code_hash text,
  verify_expires_at timestamptz,
  verify_attempts integer not null default 0,
  verified_at timestamptz,
  active boolean not null default false,
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  last_sent_on date,
  created_at timestamptz not null default now()
);
alter table public.daily_subscribers enable row level security;
