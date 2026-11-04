import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

export async function GET(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data: partner, error } = await supabase.from('partners')
    .select('id, janjez_user_id, janjez_email, display_name, status, onboarding_state, activation_amount, activation_paid_at, wallet_balance')
    .eq('id', partnerId).maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not load partner profile' }, { status: 500 });
  if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: partner });
}
