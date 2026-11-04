import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/child-users/password';
import { createChildSession } from '@/lib/child-users/session';

const schema = z.object({
  panel_id: z.string().min(1).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
  name: z.string().trim().min(2).max(100),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { panel_id: panelRef, name } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const supabase = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(panelRef);
  const { data: panel } = await supabase.from('child_panels')
    .select('id, status')
    .eq(isUuid ? 'id' : 'subdomain', panelRef)
    .in('status', ['active', 'demo'])
    .maybeSingle();
  if (!panel) return NextResponse.json({ error: 'Panel is unavailable' }, { status: 404 });

  const { data: existing, error: lookupError } = await supabase.from('child_users')
    .select('id')
    .eq('email', email)
    .eq('panel_id', panel.id)
    .maybeSingle();
  if (lookupError) return NextResponse.json({ error: 'Could not verify account availability' }, { status: 500 });
  if (existing) return NextResponse.json({ error: 'Email already registered for this panel' }, { status: 409 });

  const passwordHash = await hashPassword(parsed.data.password);
  const { data: user, error } = await supabase.from('child_users').insert({
    panel_id: panel.id,
    email,
    name,
    password_hash: passwordHash,
    status: 'active',
  }).select('id, panel_id, email, name, status').single();

  if (error || !user) return NextResponse.json({ error: 'Could not create account' }, { status: 500 });

  try {
    await createChildSession({ panel_id: panel.id, user_id: user.id, email, created_at: new Date().toISOString() });
  } catch {
    await supabase.from('child_users').delete().eq('id', user.id);
    return NextResponse.json({ error: 'Could not start a secure session' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { user } }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
