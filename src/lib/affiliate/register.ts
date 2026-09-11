import { getSupabaseAdmin } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';
import { generateAffiliateCode } from './code';

export async function createAffiliate(janjezUserId: string, panelId: string) {
  const supabase = getSupabaseAdmin();
  const code = generateAffiliateCode();

  const { data, error } = await supabase
    .from('affiliates')
    .insert({
      id: randomUUID(),
      janjez_user_id: janjezUserId,
      panel_id: panelId,
      code,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function affiliateExists(janjezUserId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('affiliates')
    .select('id')
    .eq('janjez_user_id', janjezUserId)
    .single();
  return !!data;
}