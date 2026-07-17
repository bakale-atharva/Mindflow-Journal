-- Canonical NVIDIA AI Insights migration
-- Safe to rerun. This migration intentionally does not drop ai_program_reviews:
-- remove that legacy table only after its production data has been audited.

begin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.ai_program_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  source_hash text not null check (source_hash ~ '^[a-f0-9]{64}$'),
  status text not null check (status in ('pending', 'complete', 'failed', 'safety_redirect')),
  provider text,
  model text,
  report_json jsonb,
  generation_token uuid,
  attempt_count smallint not null default 0 check (attempt_count >= 0 and attempt_count <= 2),
  error_code text,
  expires_at timestamptz not null,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_program_insights_user_id_key unique (user_id)
);

create unique index if not exists ai_program_insights_user_id_key
on public.ai_program_insights (user_id);

alter table public.ai_program_insights enable row level security;

revoke all on table public.ai_program_insights from anon, authenticated;
grant select, delete on table public.ai_program_insights to authenticated;
grant update (email_sent_at) on table public.ai_program_insights to authenticated;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'ai_program_insights'
  loop
    execute format(
      'drop policy if exists %I on public.ai_program_insights',
      policy_record.policyname
    );
  end loop;
end;
$$;

create policy "ai_program_insights_select_own"
on public.ai_program_insights for select to authenticated
using (
  (select auth.uid()) = user_id
  and public.has_active_beta_access()
  and expires_at > now()
);

create policy "ai_program_insights_update_own"
on public.ai_program_insights for update to authenticated
using (
  (select auth.uid()) = user_id
  and public.has_active_beta_access()
  and expires_at > now()
)
with check (
  (select auth.uid()) = user_id
  and public.has_active_beta_access()
  and expires_at > now()
);

create policy "ai_program_insights_delete_own"
on public.ai_program_insights for delete to authenticated
using (
  (select auth.uid()) = user_id
  and public.has_active_beta_access()
);

drop trigger if exists ai_program_insights_set_updated_at on public.ai_program_insights;
create trigger ai_program_insights_set_updated_at
before update on public.ai_program_insights
for each row execute function public.set_updated_at();

create or replace function public.claim_program_insight_generation(
  p_user_id uuid,
  p_source_hash text,
  p_is_retry boolean,
  p_provider text,
  p_model text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.ai_program_insights%rowtype;
  v_new_token uuid := gen_random_uuid();
  v_now timestamptz := now();
  v_lease_expires timestamptz := now() + interval '90 seconds';
begin
  select * into v_existing
  from public.ai_program_insights
  where user_id = p_user_id
  for update;

  if not found then
    insert into public.ai_program_insights (
      user_id, source_hash, status, attempt_count, generation_token,
      expires_at, provider, model
    ) values (
      p_user_id, p_source_hash, 'pending', 1, v_new_token,
      v_lease_expires, p_provider, p_model
    );
    return 'claimed';
  end if;

  if v_existing.source_hash != p_source_hash then
    update public.ai_program_insights set
      source_hash = p_source_hash,
      status = 'pending',
      attempt_count = 1,
      generation_token = v_new_token,
      expires_at = v_lease_expires,
      provider = p_provider,
      model = p_model,
      report_json = null,
      error_code = null,
      email_sent_at = null,
      updated_at = v_now
    where user_id = p_user_id;
    return 'claimed';
  end if;

  -- A provider or model change is a new generation configuration, not a
  -- user retry. Reset the bounded retry counter so failed work from an old
  -- configuration cannot block the current configured model.
  if v_existing.provider is distinct from p_provider
    or v_existing.model is distinct from p_model then
    update public.ai_program_insights set
      status = 'pending',
      attempt_count = 1,
      generation_token = v_new_token,
      expires_at = v_lease_expires,
      provider = p_provider,
      model = p_model,
      report_json = null,
      error_code = null,
      email_sent_at = null,
      updated_at = v_now
    where user_id = p_user_id;
    return 'claimed';
  end if;

  if v_existing.status = 'complete' then
    if v_existing.expires_at <= v_now then
      update public.ai_program_insights set
        status = 'pending',
        attempt_count = 1,
        generation_token = v_new_token,
        expires_at = v_lease_expires,
        provider = p_provider,
        model = p_model,
        report_json = null,
        error_code = null,
        email_sent_at = null,
        updated_at = v_now
      where user_id = p_user_id;
      return 'claimed';
    end if;
    return 'already_complete';
  end if;

  if v_existing.status = 'safety_redirect' then
    return 'safety_redirect';
  end if;

  if v_existing.status = 'pending' and v_existing.expires_at > v_now then
    return 'already_pending';
  end if;

  if v_existing.status = 'pending' then
    p_is_retry := true;
  end if;

  if not p_is_retry and v_existing.status = 'failed' then
    return 'retry_required';
  end if;

  if p_is_retry then
    if v_existing.attempt_count >= 2 then
      return 'retry_exhausted';
    end if;

    update public.ai_program_insights set
      status = 'pending',
      attempt_count = attempt_count + 1,
      generation_token = v_new_token,
      expires_at = v_lease_expires,
      provider = p_provider,
      model = p_model,
      error_code = null,
      updated_at = v_now
    where user_id = p_user_id;
    return 'claimed';
  end if;

  return 'already_pending';
end;
$$;

revoke all on function public.claim_program_insight_generation(uuid, text, boolean, text, text)
from public, anon, authenticated;
grant execute on function public.claim_program_insight_generation(uuid, text, boolean, text, text)
to service_role;

notify pgrst, 'reload schema';

commit;
