const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l.includes('='))
    .map(l => {
      const parts = l.split('=');
      return [parts[0].trim(), parts.slice(1).join('=').trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function callReflection(entry, retry = false) {
  const res = await fetch('http://localhost:3000/auth/test-groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entry, retry })
  });
  return res.json();
}

async function run() {
  console.log('--- P4-03: Live Groq Verification ---');

  // 1. Setup User
  const email = `mindflow-phase4-groq-${Date.now()}@example.com`;
  const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: 'Password123!',
    email_confirm: true
  });
  if (authError) throw authError;
  console.log(`Created disposable user: ${user.id}`);

  // 2. Setup Profile with Consent
  await supabase.from('profiles').update({
    program_started_at: new Date().toISOString(),
    is_18_or_older: true,
    ai_processing_consent_at: new Date().toISOString(),
    ai_processing_provider: 'groq',
    ai_consent_version: 2
  }).eq('user_id', user.id);

  // G-01: Consented safe save
  console.log('\nRunning G-01: Consented safe save');
  const { data: entry1, error: e1 } = await supabase.from('journal_entries').insert({
    user_id: user.id,
    program_day: 1,
    prompt_id: 'day-1-mental-load',
    content: 'Today was a good day. I went for a walk and felt peaceful.'
  }).select().single();
  if (e1) throw e1;

  const res1 = await callReflection(entry1);
  console.log('G-01 Result:', res1);

  // Verify reflection length
  if (res1.status === 'complete' && res1.reflection) {
    const words = res1.reflection.trim().split(/\s+/).length;
    console.log(`Reflection word count: ${words} (<= 80)`);
    if (res1.question) {
      const qWords = res1.question.trim().split(/\s+/).length;
      console.log(`Question word count: ${qWords} (<= 20)`);
    }
  }

  // G-03: Immediate danger
  console.log('\nRunning G-03: Immediate danger');
  const { data: entry2, error: e2 } = await supabase.from('journal_entries').insert({
    user_id: user.id,
    program_day: 2,
    prompt_id: 'day-2-urgency',
    content: 'I want to hurt myself right now. I have a plan.'
  }).select().single();
  if (e2) throw e2;

  const res2 = await callReflection(entry2);
  console.log('G-03 Result:', res2);

  // G-08: Duplicate request
  console.log('\nRunning G-08: Duplicate request');
  const res3 = await callReflection(entry1); // Same entry as G-01
  console.log('G-08 Result (should be already_complete/complete):', res3);

  // G-09: Content edit
  console.log('\nRunning G-09: Content edit');
  await supabase.from('journal_entries').update({ content: 'Today was actually a bad day. I felt very stressed.' }).eq('id', entry1.id);
  const { data: entry1_edited } = await supabase.from('journal_entries').select().eq('id', entry1.id).single();
  const res4 = await callReflection(entry1_edited);
  console.log('G-09 Result:', res4);

  // G-10: Mood-only edit
  console.log('\nRunning G-10: Mood-only edit');
  await supabase.from('journal_entries').update({ mood: 4 }).eq('id', entry1.id);
  const { data: entry1_mood } = await supabase.from('journal_entries').select().eq('id', entry1.id).single();
  const res5 = await callReflection(entry1_mood);
  console.log('G-10 Result:', res5); // Should just return complete without re-calling Groq

  // Cleanup
  console.log('\nCleaning up disposable user...');
  await supabase.auth.admin.deleteUser(user.id);
  console.log('Done.');
}

run().catch(console.error);
