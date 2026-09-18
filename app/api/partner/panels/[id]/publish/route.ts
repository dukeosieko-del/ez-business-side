import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { publishPanel } from '@/lib/panels/publish';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const partner = await requirePartner(request);
  if (!partner) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'No session' } },
      { status: 401 }
    );
  }

  const result = await publishPanel(id, partner.id);

  if (!result.published) {
    return NextResponse.json(
      { success: false, error: { code: 'PUBLISH_FAILED', message: result.reason ?? 'Publish failed' } },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: { published: true } });
}