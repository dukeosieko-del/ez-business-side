import { NextRequest, NextResponse } from 'next/server';
import { importServices } from '@/lib/services/import';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let serviceIds: string[] | undefined;
  try {
    const body = await req.json();
    serviceIds = body?.serviceIds;
  } catch {
    // no body — import all
  }

  try {
    const imported = await importServices(id, serviceIds);
    return NextResponse.json({ success: true, data: imported });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed';
    return NextResponse.json({ success: false, error: { code: 'IMPORT_FAILED', message } }, { status: 502 });
  }
}