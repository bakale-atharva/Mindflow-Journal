import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  // Delete all expired insights
  const { error, count } = await admin
    .from('ai_program_insights')
    .delete({ count: 'exact' })
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.error('CRON Cleanup Failed:', error);
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: count });
}
