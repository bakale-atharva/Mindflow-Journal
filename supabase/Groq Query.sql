-- Phase 3 Groq Migration for MindFlow Journal

begin;

-- 1. Extend profiles for consent versioning
alter table public.profiles
  add column if not exists ai_processing_provider text,
  add column if not exists ai_consent_version smallint,
  add column if not exists ai_processing_consent_revoked_at timestamptz;

-- Update existing profiles (legacy OpenAI consent)
update public.profiles
set ai_processing_provider = 'openai',
    ai_consent_version = 1
where ai_processing_consent_at is not null
  and ai_processing_provider is null;

-- 2. Extend ai_reflections for Groq state tracking and telemetry
alter table public.ai_reflections
  add column if not exists provider text,
  add column if not exists safety_model text,
  add column if not exists source_content_hash text,
  add column if not exists error_code text,
  add column if not exists generation_token uuid,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists viewed_at timestamptz,
  add column if not exists total_attempt_count smallint not null default 0,
  add column if not exists safety_input_tokens integer not null default 0,
  add column if not exists safety_output_tokens integer not null default 0,
  add column if not exists reflection_input_tokens integer not null default 0,
  add column if not exists reflection_output_tokens integer not null default 0,
  add column if not exists safety_latency_ms integer,
  add column if not exists reflection_latency_ms integer;

-- Drop constraints before adding them to avoid errors if they already exist
alter table public.ai_reflections drop constraint if exists ai_reflections_source_hash_check;
alter table public.ai_reflections drop constraint if exists ai_reflections_attempt_count_check;
alter table public.ai_reflections drop constraint if exists ai_reflections_total_attempt_count_check;
alter table public.ai_reflections drop constraint if exists ai_reflections_token_counts_check;
alter table public.ai_reflections drop constraint if exists ai_reflections_latency_check;

alter table public.ai_reflections
  add constraint ai_reflections_source_hash_check 
    check (source_content_hash is null or source_content_hash ~ '^[a-f0-9]{64}$'),
  add constraint ai_reflections_attempt_count_check 
    check (attempt_count >= 0 and attempt_count <= 2),
  add constraint ai_reflections_total_attempt_count_check 
    check (total_attempt_count >= 0 and total_attempt_count <= 4),
  add constraint ai_reflections_token_counts_check 
    check (
      safety_input_tokens >= 0 and 
      safety_output_tokens >= 0 and 
      reflection_input_tokens >= 0 and 
      reflection_output_tokens >= 0
    ),
  add constraint ai_reflections_latency_check 
    check (
      (safety_latency_ms is null or safety_latency_ms >= 0) and
      (reflection_latency_ms is null or reflection_latency_ms >= 0)
    );

-- 3. Atomic claim function
create or replace function public.claim_reflection_generation(
  p_entry_id uuid,
  p_user_id uuid,
  p_content_hash text,
  p_is_retry boolean,
  p_provider text,
  p_reflection_model text,
  p_safety_model text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing record;
  v_new_token uuid := gen_random_uuid();
  v_now timestamptz := now();
  v_lease_expires timestamptz := now() + interval '90 seconds';
begin
  -- Ensure entry belongs to user
  if not exists (select 1 from public.journal_entries where id = p_entry_id and user_id = p_user_id) then
    return 'entry_not_found';
  end if;

  select * into v_existing from public.ai_reflections where entry_id = p_entry_id for update;

  if not found then
    -- Initial generation
    insert into public.ai_reflections (
      entry_id, user_id, source_content_hash, status, attempt_count, total_attempt_count,
      generation_token, lease_expires_at, provider, model, safety_model,
      reflection, question, error_code, viewed_at
    ) values (
      p_entry_id, p_user_id, p_content_hash, 'pending', 1, 1,
      v_new_token, v_lease_expires, p_provider, p_reflection_model, p_safety_model,
      null, null, null, null
    );
    return 'claimed';
  end if;

  -- If content changed (not mood)
  if coalesce(v_existing.source_content_hash, '') != p_content_hash then
    if v_existing.total_attempt_count >= 4 then
      return 'retry_exhausted';
    end if;

    update public.ai_reflections set
      source_content_hash = p_content_hash,
      status = 'pending',
      attempt_count = 1,
      total_attempt_count = total_attempt_count + 1,
      generation_token = v_new_token,
      lease_expires_at = v_lease_expires,
      provider = p_provider,
      model = p_reflection_model,
      safety_model = p_safety_model,
      reflection = null,
      question = null,
      error_code = null
    where entry_id = p_entry_id;
    return 'claimed';
  end if;

  -- Same content hash
  if v_existing.status = 'complete' then return 'already_complete'; end if;
  if v_existing.status = 'safety_redirect' then return 'safety_redirect'; end if;

  if v_existing.status = 'pending' then
    if v_existing.lease_expires_at > v_now then
      return 'already_pending';
    end if;
    -- Stale request
    p_is_retry := true;
  end if;

  -- Must be explicitly retrying or claiming a stale request
  if not p_is_retry and v_existing.status = 'failed' then
    return 'retry_required';
  end if;

  if p_is_retry then
    if v_existing.attempt_count >= 2 or v_existing.total_attempt_count >= 4 then
      return 'retry_exhausted';
    end if;

    update public.ai_reflections set
      status = 'pending',
      attempt_count = attempt_count + 1,
      total_attempt_count = total_attempt_count + 1,
      generation_token = v_new_token,
      lease_expires_at = v_lease_expires,
      provider = p_provider,
      model = p_reflection_model,
      safety_model = p_safety_model,
      error_code = null
    where entry_id = p_entry_id;
    return 'claimed';
  end if;

  return 'already_pending';
end;
$$;

-- Revoke execute from public/authenticated, grant only to service_role
revoke all on function public.claim_reflection_generation(uuid, uuid, text, boolean, text, text, text) from public, anon, authenticated;
grant execute on function public.claim_reflection_generation(uuid, uuid, text, boolean, text, text, text) to service_role;

commit;
