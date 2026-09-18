import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

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

export async function PATCH(
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

  const body = await request.json();

  const branding = {
    primaryColor: String(body.primaryColor ?? '#2d7a2d').slice(0, 7),
    accentColor: String(body.accentColor ?? '#e74c3c').slice(0, 7),
    backgroundColor: String(body.backgroundColor ?? '#ffffff').slice(0, 7),
    textColor: String(body.textColor ?? '#1a1a1a').slice(0, 7),
    logo: body.logo ? String(body.logo) : null,
    favicon: body.favicon ? String(body.favicon) : null,
    fontFamily: String(body.fontFamily ?? 'Inter').slice(0, 50),
  };

  const supabase = getSupabaseAdmin();
  const { error, count } = await supabase
    .from('child_panels')
    .update({ branding })
    .eq('id', id)
    .eq('partner_id', partner.id)
    .select();

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  if (!count) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Panel not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: { branding } });
}