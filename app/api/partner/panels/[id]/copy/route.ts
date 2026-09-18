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

  const copy = {
    heroTitle: String(body.heroTitle ?? '').slice(0, 100),
    heroSubtitle: String(body.heroSubtitle ?? '').slice(0, 200),
    ctaText: String(body.ctaText ?? '').slice(0, 30),
    footerText: String(body.footerText ?? '').slice(0, 100),
    metaTitle: String(body.metaTitle ?? '').slice(0, 60),
    metaDescription: String(body.metaDescription ?? '').slice(0, 160),
  };

  const supabase = getSupabaseAdmin();
  const { error, count } = await supabase
    .from('child_panels')
    .update({ copy })
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

  return NextResponse.json({ success: true, data: { copy } });
}