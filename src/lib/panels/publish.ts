import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface PublishResult {
  published: boolean;
  reason?: string;
}

export async function publishPanel(panelId: string, partnerId: string): Promise<PublishResult> {
  const supabase = getSupabaseAdmin();
  const { data: panel } = await supabase.from('child_panels')
    .select('id, status, payment_gateways').eq('id', panelId).eq('partner_id', partnerId).maybeSingle();
  if (!panel) return { published: false, reason: 'Panel not found' };
  if (panel.status === 'demo') return { published: false, reason: 'Demo panels cannot be promoted to live. Complete provider and payment setup first.' };
  if (panel.status === 'active') return { published: false, reason: 'Panel is already live' };
  if (panel.status !== 'suspended') return { published: false, reason: 'Panel status does not permit publishing' };

  const { count: visibleServices, error: serviceError } = await supabase.from('child_services')
    .select('id', { count: 'exact', head: true }).eq('panel_id', panelId).eq('is_visible', true);
  if (serviceError) return { published: false, reason: 'Could not verify published services' };
  if (!visibleServices) return { published: false, reason: 'At least one visible service required' };
  if (!panel.payment_gateways?.length) return { published: false, reason: 'Configure and verify a payment gateway before publishing' };

  const { error } = await supabase.from('child_panels').update({ status: 'active' })
    .eq('id', panelId).eq('partner_id', partnerId).eq('status', 'suspended');
  if (error) return { published: false, reason: error.message };
  return { published: true };
}
