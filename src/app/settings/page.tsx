import { redirect } from 'next/navigation'
import { getDashboard } from '@/app/actions'
import { SettingsPanel } from '@/components/settings-panel'

export default async function SettingsPage() {
  const dashboard = await getDashboard()
  if (!dashboard.profile.onboarding_completed_at) redirect('/onboarding')
  return <SettingsPanel profile={dashboard.profile} />
}
