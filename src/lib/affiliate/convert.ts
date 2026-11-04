import { getSupabaseAdmin } from '@/lib/supabase/server';

const PAID_STATUSES = new Set(['paid', 'completed', 'fulfilled']);

export async function recordAffiliateCommissionForPaidOrder(orderId: string, clickToken: string) {
  const supabase = getSupabaseAdmin();
  const { data: order, error: orderError } = await supabase.from('child_orders')
    .select('id, status, charge, markup, payment_method, metadata')
    .eq('id', orderId).maybeSingle();
  if (orderError || !order || !PAID_STATUSES.has(order.status)) return { recorded: false, reason: 'order_not_paid' };
  if (order.payment_method === 'demo' || order.payment_method === 'demo_api' || order.metadata?.demo === true) {
    return { recorded: false, reason: 'demo_order' };
  }

  const { data: click } = await supabase.from('affiliate_clicks')
    .select('id, affiliate_id, converted_order_id').eq('click_token', clickToken).maybeSingle();
  if (!click?.affiliate_id) return { recorded: false, reason: 'attribution_not_found' };
  if (click.converted_order_id && click.converted_order_id !== orderId) return { recorded: false, reason: 'click_already_converted' };

  const { data: affiliate } = await supabase.from('affiliates')
    .select('commission_rate').eq('id', click.affiliate_id).maybeSingle();
  if (!affiliate) return { recorded: false, reason: 'affiliate_not_found' };

  const base = Math.max(0, Number(order.markup ?? order.charge ?? 0));
  const rate = Number(affiliate.commission_rate ?? 0);
  if (!Number.isFinite(base) || !Number.isFinite(rate) || rate <= 0 || rate > 1) {
    return { recorded: false, reason: 'invalid_commission_configuration' };
  }

  const amount = Math.round(base * rate * 100) / 100;
  const { data: commission, error } = await supabase.from('affiliate_commissions').insert({
    affiliate_id: click.affiliate_id,
    order_id: order.id,
    amount,
    status: 'pending',
    hold_until: new Date(Date.now() + 14 * 86400000).toISOString(),
  }).select('id, amount, status, hold_until').single();

  if (error?.code === '23505') return { recorded: false, reason: 'commission_already_exists' };
  if (error || !commission) throw new Error('Could not record affiliate commission');

  await supabase.from('affiliate_clicks').update({
    converted_order_id: order.id,
    converted_at: new Date().toISOString(),
  }).eq('id', click.id).is('converted_order_id', null);

  return { recorded: true, commission };
}
