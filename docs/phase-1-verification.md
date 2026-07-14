# Phase 1 — Activation and Isolation Verification

The Phase 1 code and canonical SQL are implemented. Complete these external steps before inviting real users.

## 1. Apply the database

1. Open the connected Supabase project’s SQL editor.
2. Run the entire `supabase/supabase_schema.sql` file.
3. Confirm the transaction completes without an error.
4. Do not run the obsolete one-line prototype migration; `supabase/supabase_schema.sql` is the complete migration-aware file.

## 2. Configure authentication

- Set the Supabase Site URL to the local or production application URL.
- Add `http://localhost:3000/auth/callback` for local testing.
- Add the production `/auth/callback` URL before deployment.
- Add `NEXT_PUBLIC_SITE_URL` to each deployed environment.
- Keep using `NEXT_PUBLIC_SUPABASE_URL` plus either the publishable key or existing anon key.

## 3. Add two test purchasers

Insert two normalized test emails into `public.beta_access` using the example at the bottom of `supabase/supabase_schema.sql`. Request a magic link for each email so both Supabase Auth users exist.

## 4. Prove database isolation

Replace the UUID and email placeholders in `supabase/supabase_rls_verification.sql`, then run it. Success produces no RLS exception and rolls back the test rows. Any raised `RLS FAILURE` is a launch blocker.

## 5. Prove the browser journey

- An email outside the allowlist receives the access-required message and no magic link.
- Each allowlisted email receives a one-use magic link.
- User A can create and delete only User A entries.
- User B cannot see User A entries after signing in separately.
- Revoking User A in `beta_access` blocks their next protected request.
- Signing out clears the session and returns to `/auth/login`.

Do not invite real users until both the SQL isolation test and the two-browser test pass.
