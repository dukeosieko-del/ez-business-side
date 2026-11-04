import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { z } from 'zod';
import { getChildSession } from '@/lib/child-users/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const allowedScopes = ['services:read', 'orders:create'] as const;
const createSchema = z.object({
  name: z.string().trim().min(2).max(64),
  scopes: z.array(z.enum(allowedScopes)).min(1).max(2).default(['services:read']),
  rate_limit: z.number().int().min(1).max(600).default(60),
  expires_in_days: z.number().int().min(1).max(365).optional(),
});

export async function GET() {
  const session = await getChildSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('child_api_keys')
    .select('id, name, scopes, rate_limit, last_used_at, expires_at, revoked_at, created_at')
    .eq('panel_id', session.panel_id).eq('child_user_id', session.user_id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Could not load API keys' }, { status: 500 });
  return NextResponse.json({ success: true, data: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const session = await getChildSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: panel } = await supabase.from('child_panels').select('status').eq('id', session.panel_id).maybeSingle();
  if (!panel || !['active', 'demo'].includes(panel.status)) return NextResponse.json({ error: 'Panel is unavailable' }, { status: 403 });

  const keyId = randomBytes(8).toString('hex');
  const secret = randomBytes(32).toString('base64url');
  const mode = panel.status === 'demo' ? 'demo' : 'live';
  const token = `jzb_${mode}_${keyId}.${secret}`;
  const expiresAt = parsed.data.expires_in_days ? new Date(Date.now() + parsed.data.expires_in_days * 86400000).toISOString() : null;

  const { data: key, error } = await supabase.from('child_api_keys').insert({
    panel_id: session.panel_id, child_user_id: session.user_id, key_id: keyId,
    key_hash: createHash('sha256').update(secret).digest('hex'), name: parsed.data.name,
    scopes: parsed.data.scopes, rate_limit: parsed.data.rate_limit, expires_at: expiresAt,
  }).select('id, name, scopes, rate_limit, expires_at, created_at').single();
  if (error || !key) return NextResponse.json({ error: 'Could not create API key' }, { status: 500 });
  return NextResponse.json({ success: true, data: { ...key, token, warning: 'Copy this secret now. It will not be shown again.' } },
    { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
