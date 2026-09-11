'use client';

import { PanelBranding } from '@/lib/tenant/context';

export function PanelThemeProvider({
  branding,
  children,
}: {
  branding: PanelBranding;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    backgroundColor: branding.backgroundColor,
    color: branding.textColor,
    fontFamily: branding.fontFamily,
    ['--panel-primary' as string]: branding.primaryColor,
    ['--panel-accent' as string]: branding.accentColor,
  };

  return <div style={style}>{children}</div>;
}
