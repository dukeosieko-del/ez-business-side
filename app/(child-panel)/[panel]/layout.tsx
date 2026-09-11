import { notFound } from 'next/navigation';
import { getPanelContext } from '@/lib/tenant/context';
import { PanelThemeProvider } from '@/components/child-panel/ThemeProvider';

export default async function ChildPanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ panel: string }>;
}) {
  const { panel: subdomain } = await params;
  const context = await getPanelContext({ subdomain });

  if (!context) {
    notFound();
  }

  return (
    <PanelThemeProvider branding={context.branding}>
      {children}
    </PanelThemeProvider>
  );
}
