import 'server-only';
import { callJanjez } from '@/lib/janjez-api/client';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface JanjezService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  min_quantity: number;
  max_quantity: number;
  category: string | null;
}

export interface SyncedService {
  id: string;
  panel_id: string;
  janjez_service_id: string;
  child_price: number;
  child_min_quantity: number;
  child_max_quantity: number;
  custom_name: string | null;
  custom_description: string | null;
  is_visible: boolean;
  is_drip_feed_enabled: boolean;
  display_order: number;
  imported_at: string;
}

export async function syncServices(panelId: string): Promise<SyncedService[]> {
  const janjezServices = await callJanjez<JanjezService[]>({
    method: 'GET',
    path: '/services',
  });

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from('child_services')
    .select('janjez_service_id')
    .eq('panel_id', panelId);

  const existingIds = new Set((existing ?? []).map((s) => s.janjez_service_id));

  const toUpsert = janjezServices
    .filter((s) => !existingIds.has(s.id))
    .map((s, index): SyncedService => ({
      id: `${panelId}-${s.id}`,
      panel_id: panelId,
      janjez_service_id: s.id,
      child_price: Math.round((s.price ?? 1000) * 2),
      child_min_quantity: s.min_quantity ?? 10,
      child_max_quantity: s.max_quantity ?? 10000,
      custom_name: null,
      custom_description: null,
      is_visible: false,
      is_drip_feed_enabled: false,
      display_order: index,
      imported_at: new Date().toISOString(),
    }));

  if (toUpsert.length > 0) {
    const { error } = await supabase.from('child_services').upsert(toUpsert);
    if (error) {
      throw new Error(`Service sync failed: ${error.message}`);
    }
  }

  return toUpsert;
}
