-- Migration: Phase 5 Analytics (Seven-Day Completion Reflection)
-- Description: Adds the ai_program_reviews table for storing the synthesized reflection and practice upon program completion.

create table if not exists public.ai_program_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  source_hash text not null,
  status text not null,
  provider text,
  model text,
  safety_flags jsonb,
  reflection text,
  practice text,
  practice_kept_at timestamp with time zone,
  attempt_count smallint not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint ai_program_reviews_status_check check (status in ('pending', 'complete', 'failed', 'safety_redirect'))
);

create unique index if not exists ai_program_reviews_user_id_idx on public.ai_program_reviews(user_id);

alter table public.ai_program_reviews enable row level security;

create policy "Users can read own program reviews"
  on public.ai_program_reviews
  for select
  to authenticated
  using (auth.uid() = user_id);

create trigger ai_program_reviews_set_updated_at
  before update on public.ai_program_reviews
  for each row
  execute function public.set_updated_at();
