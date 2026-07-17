import 'server-only'

import { createAdminClient } from '@/lib/admin'

export type ProductEventName =
  | 'first_login'
  | 'program_started'
  | 'entry_saved'
  | 'reflection_viewed'
  | 'day_2_return'
  | 'program_completed'
  | 'program_review_created'
  | 'insight_deleted'
  | 'insight_emailed'

export async function recordProductEvent(
  userId: string,
  eventName: ProductEventName,
  metadata: Record<string, string | number | boolean> = {}
) {
  const admin = createAdminClient()
  if (!admin) return
  const { error } = await admin.from('product_events').insert({
    user_id: userId,
    event_name: eventName,
    metadata,
  })
  if (error) console.error('Product event failed:', error.message)
}
