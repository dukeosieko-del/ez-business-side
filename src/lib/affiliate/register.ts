import { getSupabaseAdmin } from '@/lib/supabase/server';
import { generateAffiliateCode } from './code';

export async function createAffiliate(janjezUserId: string) {
  const supabase = getSupabaseAdmin();
  const { data: existing, error: lookupError } = await supabase
    .from('affiliates')
    .select('*')
    .eq('janjez_user_id', janjezUserId)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from('affiliates')
    .insert({
      janjez_user_id: janjezUserId,
      affiliate_code: generateAffiliateCode(),
      commission_rate: 0.1,
      status: 'active',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function affiliateExists(janjezUserId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('affiliates')
    .select('id')
    .eq('janjez_user_id', janjezUserId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}
