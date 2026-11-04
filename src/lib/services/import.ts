import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { callJanjez } from '@/lib/janjez-api/client';

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
  id: string;
  janjez_service_id: string;
  panel_id: string;
  cost: number;
  child_price: number;
  child_min_quantity: number;
  child_max_quantity: number;
  custom_name: string | null;
  custom_description: string | null;
  is_visible: boolean;
  is_drip_feed_enabled: boolean;
  display_order: number;
}

export function applyMarkup(basePrice: number, markupPercent = 50): number {
  const safeMarkup = Math.max(0, Math.min(100, Number(markupPercent)));
  const price = Number(basePrice);
  if (!Number.isFinite(price) || price < 0) throw new Error('Invalid service base price');
  return Math.round(price * (1 + safeMarkup / 100) * 100) / 100;
}

export async function importServices(panelId: string, serviceIds?: string[]): Promise<ImportedService[]> {
  const supabase = getSupabaseAdmin();
  const services = await callJanjez<JanjezService[]>({ method: 'GET', path: '/services' });
  if (!Array.isArray(services)) throw new Error('Janjez Main returned an invalid service catalogue');

  const selected = serviceIds?.length ? services.filter((service) => serviceIds.includes(service.id)) : services;
  if (serviceIds?.length && selected.length !== serviceIds.length) {
    throw new Error('One or more selected Main services were not found');
  }

  const { data: existing, error: existingError } = await supabase.from('child_services')
    .select('id, janjez_service_id, cost, child_price, child_min_quantity, child_max_quantity, custom_name, custom_description, is_visible, is_drip_feed_enabled, display_order')
    .eq('panel_id', panelId);
  if (existingError) throw new Error('Could not load existing panel services');

  const existingByMainId = new Map((existing ?? []).map((row) => [row.janjez_service_id, row]));
  const rows = selected.map((service, index) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(service.id)) {
      throw new Error('Main service ID is not a UUID');
    }
    const basePrice = Number(service.price);
    const old = existingByMainId.get(service.id);
    const min = Math.max(1, Math.floor(Number(service.min_quantity) || 1));
    const max = Math.max(min, Math.floor(Number(service.max_quantity) || 100000));
    return {
      panel_id: panelId,
      janjez_service_id: service.id,
      cost: basePrice,
      child_price: old ? Number(old.child_price) : applyMarkup(basePrice, 50),
      child_min_quantity: min,
      child_max_quantity: max,
      custom_name: old?.custom_name ?? null,
      custom_description: old?.custom_description ?? service.description ?? null,
      is_visible: old?.is_visible ?? true,
      is_drip_feed_enabled: old?.is_drip_feed_enabled ?? false,
      display_order: old?.display_order ?? index + 1,
    };
  });

  if (!rows.length) return [];
  const { data, error } = await supabase.from('child_services')
    .upsert(rows, { onConflict: 'panel_id, janjez_service_id' })
    .select('id, janjez_service_id, panel_id, cost, child_price, child_min_quantity, child_max_quantity, custom_name, custom_description, is_visible, is_drip_feed_enabled, display_order');
  if (error) throw new Error(`Service import failed: ${error.message}`);
  return (data ?? []) as ImportedService[];
}
