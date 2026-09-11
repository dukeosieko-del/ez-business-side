import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { verifyPassword } from '@/lib/child-users/password';
import { createChildSession } from '@/lib/child-users/session';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { panel_id, email, password } = body;

  if (!panel_id || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from('child_users')
    .select('*')
    .eq('email', email)
    .eq('panel_id', panel_id)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  await createChildSession({ panel_id, user_id: user.id, email: user.email });

  return NextResponse.json({ success: true, data: { user } });
}