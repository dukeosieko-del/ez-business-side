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
  let services: JanjezService[];
  if (serviceIds && serviceIds.length > 0) {
    services = await Promise.all(
      serviceIds.map((id) => callJanjez<JanjezService>({ method: 'GET', path: `/services/${id}` }))
    );
  } else {
    services = await callJanjez<JanjezService[]>({ method: 'GET', path: '/services' });
  }

  const supabase = getSupabaseAdmin();

  const imported: ImportedService[] = services.map((service, index) => ({
    janjez_service_id: service.id ?? '',
    panel_id: panelId,
    child_price: applyMarkup(service.price ?? 1000),
    child_min_quantity: service.min_quantity ?? 10,
    child_max_quantity: service.max_quantity ?? 10000,
    custom_name: null,
    custom_description: null,
    is_visible: false,
    is_drip_feed_enabled: false,
    display_order: index,
  }));

  const { error } = await supabase.from('child_services').insert(imported);
  if (error) {
    throw new Error(`Service import failed: ${error.message}`);
  }

  return imported;
}
