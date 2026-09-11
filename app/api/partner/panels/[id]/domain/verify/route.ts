import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { resolveCname } from 'dns/promises';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = request.cookies.get('jez_bs_session')?.value;
  if (!session) {
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
      .eq('partner_id', session)
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
        .eq('id', id);
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
