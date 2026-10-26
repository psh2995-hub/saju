-- 해외(영문) 페이지: 풀이 언어와 별자리 타로 상품 추가
alter table public.readings add column lang text not null default 'ko' check (lang in ('ko', 'en'));

alter table public.readings drop constraint readings_kind_check;
alter table public.readings add constraint readings_kind_check check (kind in ('saju', 'tarot', 'gunghap', 'newyear', 'zodiac'));
