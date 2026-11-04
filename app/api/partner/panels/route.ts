import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

export async function GET(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data: panels, error } = await supabase.from('child_panels')
    .select('id, partner_id, subdomain, custom_domain, status, created_at')
    .eq('partner_id', partnerId).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Could not load reseller panels' }, { status: 500 });
  return NextResponse.json({ success: true, data: panels ?? [] });
}
