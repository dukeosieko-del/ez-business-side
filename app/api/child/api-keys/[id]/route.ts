import { NextRequest, NextResponse } from 'next/server';
import { getChildSession } from '@/lib/child-users/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getChildSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('child_api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('panel_id', session.panel_id)
    .eq('child_user_id', session.user_id)
    .is('revoked_at', null)
    .select('id')
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not revoke API key' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'API key not found or already revoked' }, { status: 404 });
  return NextResponse.json({ success: true });
}
