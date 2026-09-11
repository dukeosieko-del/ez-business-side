import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function PATCH(
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
  const { error } = await supabase
    .from('child_panels')
    .update({ copy })
    .eq('id', id)
    .eq('partner_id', session);

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { copy } });
}
