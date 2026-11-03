import 'server-only';
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
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('child_services').select('*').eq('panel_id', panelId);
  return (data ?? []) as SyncedService[];
}
