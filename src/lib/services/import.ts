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

export interface ImportedService {
  janjez_service_id: string;
  panel_id: string;
  child_price: number;
  child_min_quantity: number;
  child_max_quantity: number;
  custom_name: string | null;
  custom_description: string | null;
  is_visible: boolean;
  is_drip_feed_enabled: boolean;
  display_order: number;
}

export function applyMarkup(basePrice: number): number {
  return Math.round(basePrice * 2);
}

export async function importServices(
  panelId: string,
  serviceIds?: string[]
): Promise<ImportedService[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('child_services').select('*').eq('panel_id', panelId);
  return (data ?? []) as ImportedService[];
}
