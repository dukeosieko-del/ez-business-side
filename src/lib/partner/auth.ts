import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

/**
 * Resolve the authenticated partner from the session cookie.
 * Returns the partner id or null if unauthenticated/expired.
 */
export async function getAuthenticatedPartner(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('jez_bs_session')?.value;
  if (!token) return null;

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return session?.partner_id ?? null;
}

/**
 * Verify that a child panel belongs to the authenticated partner.
 */
export async function verifyPanelOwnership(
  partnerId: string,
  panelId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('child_panels')
    .select('id')
    .eq('id', panelId)
    .eq('partner_id', partnerId)
    .maybeSingle();
  return !!data;
}