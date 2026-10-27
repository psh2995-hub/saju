-- 결제 통화. 영문 페이지는 토스페이먼츠 달러 채널이 설정되면 USD(센트 단위)로 받는다.
alter table public.readings add column currency text not null default 'KRW' check (currency in ('KRW', 'USD'));
alter table public.followups add column currency text not null default 'KRW' check (currency in ('KRW', 'USD'));
