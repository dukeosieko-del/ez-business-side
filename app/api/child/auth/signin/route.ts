import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createChildSession, getChildSession } from '@/lib/child-users/session';
import { verifyPassword } from '@/lib/child-users/password';

const schema = z.object({
  panel_id: z.string().min(1).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const panelRef = parsed.data.panel_id;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(panelRef);
  const supabase = getSupabaseAdmin();
  const { data: panel } = await supabase.from('child_panels')
    .select('id, status')
    .eq(isUuid ? 'id' : 'subdomain', panelRef)
    .in('status', ['active', 'demo'])
    .maybeSingle();
  if (!panel) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const { data: user, error } = await supabase.from('child_users')
    .select('id, panel_id, email, name, password_hash, status')
    .eq('email', email)
    .eq('panel_id', panel.id)
    .maybeSingle();
  if (error || !user || user.status !== 'active') return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const valid = await verifyPassword(parsed.data.password, user.password_hash);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  await createChildSession({ panel_id: panel.id, user_id: user.id, email: user.email, created_at: new Date().toISOString() });
  return NextResponse.json({
    success: true,
    data: { user: { id: user.id, panel_id: user.panel_id, email: user.email, name: user.name } },
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function GET() {
  const session = await getChildSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ success: true, data: session }, { headers: { 'Cache-Control': 'no-store' } });
}
