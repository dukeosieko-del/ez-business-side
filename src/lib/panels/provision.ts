import { getSupabaseAdmin } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

interface DemoServiceDef {
  name: string;
  category: string;
  price: number;
  minQty: number;
  maxQty: number;
}

const DEMO_SERVICES: DemoServiceDef[] = [
  { name: 'Instagram Followers', category: 'social', price: 1200, minQty: 100, maxQty: 10000 },
  { name: 'Instagram Likes', category: 'social', price: 800, minQty: 50, maxQty: 5000 },
  { name: 'TikTok Views', category: 'video', price: 1500, minQty: 100, maxQty: 10000 },
  { name: 'YouTube Subscribers', category: 'video', price: 2000, minQty: 50, maxQty: 5000 },
  { name: 'Twitter Retweets', category: 'social', price: 600, minQty: 100, maxQty: 2000 },
];

export interface DemoPanel {
  id: string;
  partner_id: string;
  subdomain: string;
  name: string;
  status?: string;
}

export async function provisionDemoPanel(partnerId: string): Promise<DemoPanel> {
  const supabase = getSupabaseAdmin();
  const subdomain = `demo-${randomUUID().slice(0, 8)}`;

  const { data: panel, error: panelError } = await supabase
    .from('child_panels')
    .insert({
      partner_id: partnerId,
      subdomain,
      custom_domain: null,
      custom_domain_verified: false,
      branding: {},
      copy: {},
      payment_gateways: [],
      status: 'demo',
    })
    .select('id, partner_id, subdomain, status')
    .single();

  if (panelError || !panel) {
    throw new Error(`Demo panel creation failed: ${panelError?.message ?? 'unknown'}`);
  }

  const demoServices = DEMO_SERVICES.map((s) => ({
    panel_id: panel.id,
    janjez_service_id: '',
    child_price: s.price,
    child_min_quantity: s.minQty,
    child_max_quantity: s.maxQty,
    is_visible: false,
    is_drip_feed_enabled: false,
    display_order: 0,
    custom_name: s.name,
    custom_description: '',
    imported_at: new Date().toISOString(),
  }));

  const { error: servicesError } = await supabase
    .from('child_services')
    .insert(demoServices);

  if (servicesError) {
    throw new Error(`Demo services insertion failed: ${servicesError.message}`);
  }

  return { id: panel.id, partner_id: panel.partner_id, subdomain: panel.subdomain, name: 'Demo Panel' };
}

export async function hasPanels(partnerId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from('child_panels')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', partnerId);

  return (count ?? 0) > 0;
}
