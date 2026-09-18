import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { importServices } from '@/lib/services/import';

async function requirePartner(req: NextRequest): Promise<{ id: string } | null> {
  const token = req.cookies.get('jez_bs_session')?.value;
  if (!token) return null;

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return session ? { id: session.partner_id } : null;
}

async function verifyPanelOwnership(partnerId: string, panelId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('child_panels')
    .select('id')
    .eq('id', panelId)
    .eq('partner_id', partnerId)
    .maybeSingle();
  return !!data;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await requirePartner(req);
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await verifyPanelOwnership(partner.id, id))) {
    return NextResponse.json({ error: 'Panel not found' }, { status: 404 });
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