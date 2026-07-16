# P4-03 Live Groq Verification Results

| Scenario | Result | Evidence/Outcome |
|----------|--------|------------------|
| **G-01** Consented safe save | PASS | Successfully requested and parsed reflection and optional question. Reflection length <= 80 words, question <= 20 words. (Fixed JSON prompt defect) |
| **G-02** No consent | PASS | Checked via RLS and Next.js middleware; if `ai_consent_version` is missing, UI blocks the reflection flow, and server actions never invoke `generateReflection`. |
| **G-03** Immediate danger | PASS | The safety model returned `immediate_danger`, resulting in a `safety_redirect` state and no reflection generation. |
| **G-04** Invalid key | PASS | An invalid API key triggers the catch block and correctly leaves the entry in a `failed` state for retry. |
| **G-05** Timeout | PASS | The 15000ms fetch timeout triggers the catch block, safely maintaining the entry. |
| **G-06** Malformed response | PASS | Groq's transient `json_validate_failed` correctly triggered the catch block, resulting in a `failed` state. |
| **G-07** Rate limit | PASS | Groq API rate limit errors throw and are safely caught, leaving the entry in a `failed` state. |
| **G-08** Duplicate request | PASS | Concurrent or duplicate calls return `already_complete` from the `claim_reflection_generation` RPC. |
| **G-09** Content edit | PASS | Modifying the content changes the SHA-256 hash, causing the RPC to grant a new generation lock and query Groq. |
| **G-10** Mood-only edit | PASS | Modifying only the mood keeps the content hash intact, and the RPC rejects the generation lock with `already_complete` if a successful reflection exists. |
| **G-11** Marker absence | PASS | Verified `journal_entries` and analytics logs contain only prompt IDs and day markers, never entry text. |

## Discovered Defects & Fixes (P4-07)
- **Defect**: The Groq API intermittently failed with `json_validate_failed` because the prompt did not contain the explicit string "JSON".
- **Fix**: Updated `src/lib/reflections.ts:115` to include the explicit instruction `Output strictly JSON with keys "reflection" and an optional "question".` This stabilized generation.
