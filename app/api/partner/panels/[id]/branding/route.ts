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
  const { error } = await supabase
    .from('child_panels')
    .update({ branding })
    .eq('id', id)
    .eq('partner_id', session);

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { branding } });
}
