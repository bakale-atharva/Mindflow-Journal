import { redirect } from 'next/navigation'
import { getDashboard } from '@/app/actions'
import { OnboardingFlow } from '@/components/onboarding-flow'
import { ThoughtContour } from '@/components/thought-contour'

export default async function OnboardingPage() {
  const dashboard = await getDashboard()
  if (dashboard.profile.onboarding_completed_at && dashboard.profile.program_started_at) redirect('/')
  return (
    <div className="relative flex min-h-dvh justify-center overflow-hidden px-4 py-6 sm:px-8 lg:px-12 lg:py-8">
      <ThoughtContour compact className="pointer-events-none absolute -left-20 top-12 w-[420px] rotate-[-10deg] opacity-55" />
      <ThoughtContour mood={5} compact className="pointer-events-none absolute -bottom-16 -right-24 w-[460px] rotate-[12deg] opacity-45" />
      <div className="relative z-10 w-full"><OnboardingFlow /></div>
    </div>
  )
}
