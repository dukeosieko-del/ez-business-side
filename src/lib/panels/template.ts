import { PanelCopy } from '@/lib/tenant/context';

export const PANEL_TEMPLATE_COPY: PanelCopy = {
  heroTitle: 'Boost Your Social Media — Delivered in Minutes',
  heroSubtitle:
    'Instagram, TikTok, YouTube, Facebook, and more. Pay with M-Pesa. No signup required.',
  ctaText: 'Browse Our Services',
  footerText: 'Powered by Janjez · Secure M-Pesa Payments',
  metaTitle: 'SMM Panel',
  metaDescription:
    'Instant social media growth. M-Pesa accepted. Trusted by Kenyan creators and businesses.',
};

export function generateCopyFromPanelName(displayName: string): PanelCopy {
  return {
    ...PANEL_TEMPLATE_COPY,
    heroTitle: `Welcome to ${displayName}`,
    metaTitle: `${displayName} — Social Media Growth`,
    footerText: `Powered by ${displayName}`,
  };
}
