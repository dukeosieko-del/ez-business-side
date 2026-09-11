import { getSupabaseAdmin } from '@/lib/supabase/server';
import { Partner, PartnerStatus } from '@/types/partner';

export interface ValidateResult {
  valid: boolean;
  partner: Partner | string;
}

export async function validateActivationReadiness(partnerId: string): Promise<ValidateResult> {
  const supabase = getSupabaseAdmin();
  const { data: partner, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', partnerId)
    .single();

  if (error || !partner) {
    return { valid: false, partner: 'Partner not found' };
  }

  if (partner.status !== PartnerStatus.Pending) {
    return { valid: false, partner: `Partner status is ${partner.status}, expected 'pending'` };
  }

  return { valid: true, partner };
}
