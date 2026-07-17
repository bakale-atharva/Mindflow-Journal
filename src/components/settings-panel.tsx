'use client'

import { useActionState, useState } from 'react'
import { LogOut, ShieldCheck, Sparkles, Trash2 } from 'lucide-react'
import { deleteAccount, updateAiConsent, type ProfileState } from '@/app/actions'
import { signOut } from '@/app/auth/actions'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { hasActiveNvidiaConsent, NVIDIA_CONSENT_VERSION } from '@/lib/nvidia-ai-config'

export function SettingsPanel({ profile }: { profile: ProfileState }) {
  const [consentState, consentAction, consentPending] = useActionState(updateAiConsent, null)
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAccount, null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const consentEnabled = hasActiveNvidiaConsent(profile)
  const hasLegacyConsent = profile.ai_processing_consent_at !== null && (profile.ai_consent_version !== NVIDIA_CONSENT_VERSION || profile.ai_processing_provider !== 'nvidia')

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-7 sm:py-10 lg:px-10">
      <header className="border-b border-ink/8 pb-8"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-ink/42">Preferences and privacy</p><h1 className="mt-3 font-heading text-5xl font-semibold tracking-[-.065em] text-ink sm:text-6xl">Settings</h1><p className="mt-4 text-base text-ink/52">Signed in as {profile.email}</p></header>
      <div className="mt-8 space-y-5">
        <section className="surface rounded-[28px] p-6 sm:p-7"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-orchid-mist text-primary"><Sparkles className="size-5" /></span><div><h2 className="font-heading text-2xl font-semibold tracking-[-.04em]">AI reflections</h2><p className="mt-2 max-w-xl text-sm leading-6 text-ink/55">When enabled, saved entry text is sent to NVIDIA for automated safety screening and one concise reflection. Turning this off does not remove or block your journal.</p></div></div><form action={consentAction} className="mt-6 flex flex-wrap items-center gap-3"><input type="hidden" name="ai_consent" value={consentEnabled ? 'no' : 'yes'} /><button disabled={consentPending} className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{consentPending ? 'Updating…' : consentEnabled ? 'Turn off reflections' : hasLegacyConsent ? 'Update to NVIDIA AI reflections' : 'Turn on reflections'}</button><span className="rounded-full bg-porcelain px-3 py-2 text-xs font-semibold text-ink/48">Currently {consentEnabled ? 'on' : 'off'}</span></form>{hasLegacyConsent && !consentEnabled && !consentPending ? <p className="mt-3 text-sm text-coral font-medium">Your legacy consent is no longer valid. Please update to NVIDIA to continue receiving reflections.</p> : null}{consentState ? <p className={`mt-3 text-sm ${consentState.status === 'error' ? 'text-destructive' : 'text-ink/55'}`}>{consentState.status === 'error' ? consentState.error : consentState.message}</p> : null}</section>
        <section className="surface rounded-[28px] p-6 sm:p-7"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-seafoam/60"><ShieldCheck className="size-5" /></span><div><h2 className="font-heading text-2xl font-semibold tracking-[-.04em]">Privacy boundary</h2><p className="mt-2 max-w-xl text-sm leading-6 text-ink/55">The founder does not read journal content for routine support. Product events never contain entry text. MindFlow is not therapy, diagnosis, medical advice, or crisis support.</p></div></div></section>
        <section className="surface rounded-[28px] p-6 sm:p-7"><h2 className="font-heading text-2xl font-semibold tracking-[-.04em]">Account</h2><div className="mt-5 flex flex-wrap gap-3"><form action={signOut}><button className="inline-flex items-center gap-2 rounded-2xl border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink"><LogOut className="size-4" />Sign out</button></form><button onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-destructive hover:bg-red-50"><Trash2 className="size-4" />Delete account and journal</button></div></section>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}><DialogContent className="rounded-[28px] p-6 sm:max-w-md"><DialogHeader><DialogTitle className="font-heading text-2xl tracking-[-.04em]">Permanently delete everything?</DialogTitle><DialogDescription className="leading-6">This removes your account, entries, reflections, and attributable product events. It cannot be undone.</DialogDescription></DialogHeader><form action={deleteAction} className="mt-3"><label htmlFor="confirmation" className="text-sm font-semibold text-ink">Type DELETE to confirm</label><input id="confirmation" name="confirmation" autoComplete="off" className="mt-2 w-full rounded-2xl border border-ink/12 bg-porcelain px-4 py-3 outline-none focus:border-primary" />{deleteState?.status === 'error' ? <p className="mt-3 text-sm text-destructive">{deleteState.error}</p> : null}<div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setDeleteOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink/55">Cancel</button><button disabled={deletePending} className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{deletePending ? 'Deleting…' : 'Delete permanently'}</button></div></form></DialogContent></Dialog>
    </div>
  )
}
