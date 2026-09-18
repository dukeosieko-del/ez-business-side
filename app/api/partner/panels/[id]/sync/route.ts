import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner, verifyPanelOwnership } from '@/lib/partner/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partnerId = await getAuthenticatedPartner(req);
  if (!partnerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await verifyPanelOwnership(partnerId, id))) {
    return NextResponse.json({ error: 'Panel not found' }, { status: 404 });
  }

  try {
    const { syncServices } = await import('@/lib/services/sync');
    const synced = await syncServices(id);
    return NextResponse.json({ success: true, data: synced });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ success: false, error: { code: 'SYNC_FAILED', message } }, { status: 502 });
  }
}