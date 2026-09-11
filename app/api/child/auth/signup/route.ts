import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/child-users/password';
import { createChildSession } from '@/lib/child-users/session';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { panel_id, email, password, name } = body;

  if (!panel_id || !email || !password || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from('child_users')
    .select('id')
    .eq('email', email)
    .eq('panel_id', panel_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Email already registered for this panel' }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);

  const { data: user, error } = await supabase
    .from('child_users')
    .insert({
      panel_id,
      email,
      password_hash: hashedPassword,
      name,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await createChildSession({ panel_id, user_id: user.id, email });

  return NextResponse.json({ success: true, data: { user } });
}