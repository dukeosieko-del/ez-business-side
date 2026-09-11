import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface PublishResult {
  published: boolean;
  reason?: string;
}

export async function publishPanel(
  panelId: string,
  partnerId: string
): Promise<PublishResult> {
  const supabase = getSupabaseAdmin();

  const { data: panel } = await supabase
    .from('child_panels')
    .select('id, status')
    .eq('id', panelId)
    .eq('partner_id', partnerId)
    .maybeSingle();

  if (!panel) return { published: false, reason: 'Panel not found' };

  const { count: visibleServices } = await supabase
    .from('child_services')
    .select('*', { count: 'exact', head: true })
    .eq('panel_id', panelId)
    .eq('is_visible', true);

  if (!visibleServices || visibleServices === 0) {
    return { published: false, reason: 'At least one visible service required' };
  }

  const { error } = await supabase
    .from('child_panels')
    .update({ status: 'active' })
    .eq('id', panelId);

  if (error) return { published: false, reason: error.message };

  return { published: true };
}
