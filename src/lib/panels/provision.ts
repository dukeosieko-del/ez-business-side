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

  // One reusable demo tenant per partner prevents accidental demo-panel sprawl.
  const { data: existing } = await supabase
    .from('child_panels')
    .select('id, partner_id, subdomain, status')
    .eq('partner_id', partnerId)
    .eq('status', 'demo')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      partner_id: existing.partner_id,
      subdomain: existing.subdomain,
      name: 'Demo Panel',
      status: existing.status,
    };
  }

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

  const now = new Date().toISOString();
  const demoServices = DEMO_SERVICES.map((service, index) => ({
    panel_id: panel.id,
    janjez_service_id: '',
    child_price: service.price,
    cost: 0,
    child_min_quantity: service.minQty,
    child_max_quantity: service.maxQty,
    is_visible: true,
    is_drip_feed_enabled: false,
    display_order: index + 1,
    custom_name: service.name,
    custom_description: `Demo-only ${service.category} service. No provider order or real charge is made.`,
    imported_at: now,
  }));

  const { error: servicesError } = await supabase.from('child_services').insert(demoServices);
  if (servicesError) {
    await supabase.from('child_panels').delete().eq('id', panel.id);
    throw new Error(`Demo services insertion failed: ${servicesError.message}`);
  }

  return {
    id: panel.id,
    partner_id: panel.partner_id,
    subdomain: panel.subdomain,
    name: 'Demo Panel',
    status: panel.status,
  };
}

export async function hasPanels(partnerId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from('child_panels')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', partnerId);

  if (error) throw new Error('Could not check panel provisioning');
  return (count ?? 0) > 0;
}
