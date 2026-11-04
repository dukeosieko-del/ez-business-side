import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface PanelContext {
  panelId: string;
  partnerId: string;
  subdomain: string;
  customDomain: string | null;
  branding: PanelBranding;
  copy: PanelCopy;
  status: 'demo' | 'active' | 'suspended';
  paymentGateways: string[];
}

export interface PanelBranding {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logo: string | null;
  favicon: string | null;
  fontFamily: string;
}

export interface PanelCopy {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  footerText: string;
  metaTitle: string;
  metaDescription: string;
}

export const DEFAULT_BRANDING: PanelBranding = {
  primaryColor: '#2d7a2d',
  accentColor: '#e74c3c',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  logo: null,
  favicon: null,
  fontFamily: 'Inter',
};

export const DEFAULT_COPY: PanelCopy = {
  heroTitle: 'Social Media Growth — Instant & Reliable',
  heroSubtitle: 'Browse services, manage orders, and pay securely.',
  ctaText: 'Browse Services',
  footerText: 'Powered by Janjez',
  metaTitle: 'SMM Panel',
  metaDescription: 'Social media marketing services.',
};

export async function getPanelContext(panelIdOrSubdomain: {
  panelId?: string;
  subdomain?: string;
}): Promise<PanelContext | null> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('child_panels')
    .select('*, partners!inner(id)')
    .in('status', ['active', 'demo']);

  const { data, error } = panelIdOrSubdomain.panelId
    ? await query.eq('id', panelIdOrSubdomain.panelId).maybeSingle()
    : await query.eq('subdomain', panelIdOrSubdomain.subdomain).maybeSingle();

  if (error || !data) return null;

  const branding = {
    ...DEFAULT_BRANDING,
    ...(typeof data.branding === 'object' && data.branding !== null ? data.branding : {}),
  } as PanelBranding;

  const copy = {
    ...DEFAULT_COPY,
    ...(typeof data.copy === 'object' && data.copy !== null ? data.copy : {}),
  } as PanelCopy;

  const partner = Array.isArray(data.partners) ? data.partners[0] : data.partners;

  return {
    panelId: data.id,
    partnerId: partner?.id ?? data.partner_id,
    subdomain: data.subdomain,
    customDomain: data.custom_domain,
    branding,
    copy,
    status: data.status as 'demo' | 'active',
    paymentGateways: data.status === 'demo' ? [] : (data.payment_gateways ?? ['mpesa']),
  };
}

export async function getPanelContextByDomain(host: string): Promise<PanelContext | null> {
  if (host.endsWith('.partners.janjez.social')) {
    const subdomain = host.replace('.partners.janjez.social', '');
    return getPanelContext({ subdomain });
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('child_panels')
    .select('id')
    .eq('custom_domain', host)
    .eq('custom_domain_verified', true)
    .eq('status', 'active')
    .maybeSingle();

  if (!data) return null;
  return getPanelContext({ panelId: data.id });
}
