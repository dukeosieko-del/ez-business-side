import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { resolveCname } from 'dns/promises';

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const supabase = getSupabaseAdmin();
    const { data: panel } = await supabase
      .from('child_panels')
      .select('custom_domain')
      .eq('id', id)
      .eq('partner_id', partner.id)
      .maybeSingle();

    if (!panel?.custom_domain) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_DOMAIN', message: 'No custom domain set' } },
        { status: 400 }
      );
    }

    const records = await resolveCname(panel.custom_domain);
    const verified = records.some(
      (r) => r.toLowerCase().includes('partners.janjez.social')
    );

    if (verified) {
      await supabase
        .from('child_panels')
        .update({ custom_domain_verified: true })
        .eq('id', id)
        .eq('partner_id', partner.id);
    }

    return NextResponse.json({ success: true, data: { verified } });
  } catch {
    return NextResponse.json({
      success: true,
      data: { verified: false, reason: 'DNS lookup failed' },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}