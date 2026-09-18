import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

async function getPartnerFromCookie(cookie?: string): Promise<{ id: string } | null> {
  if (!cookie) return null;
  const tokenHash = createHash('sha256').update(cookie).digest('hex');

  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return session ? { id: session.partner_id } : null;
}

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie')?.match(/jez_bs_session=([^;]+)/)?.[1];
    const partner = await getPartnerFromCookie(cookie);

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: panels } = await supabase
      .from('child_panels')
      .select('id, partner_id, subdomain, custom_domain, status, created_at')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ success: true, data: panels ?? [] });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Request failed' } }, { status: 500 });
  }
}