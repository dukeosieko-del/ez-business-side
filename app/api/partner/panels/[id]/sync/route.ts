import { NextRequest, NextResponse } from 'next/server';
import { syncServices } from '@/lib/services/sync';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const synced = await syncServices(id);
    return NextResponse.json({ success: true, data: synced });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ success: false, error: { code: 'SYNC_FAILED', message } }, { status: 502 });
  }
}