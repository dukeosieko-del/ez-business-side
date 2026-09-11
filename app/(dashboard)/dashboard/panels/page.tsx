'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { provisionDemoPanel } from '@/lib/panels/provision';
import { PublishButton } from '@/components/dashboard/PublishButton';

interface RawPanel {
  id: string;
  partner_id: string;
  subdomain: string;
  status: string;
  created_at: string;
}

interface DisplayPanel extends RawPanel {
  name: string;
}

export default function PanelsPage() {
  const [panels, setPanels] = useState<DisplayPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseAdmin();
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;

        if (userId) {
          const { data } = await supabase
            .from('child_panels')
            .select('id, partner_id, subdomain, status, created_at')
            .eq('partner_id', userId)
            .order('created_at', { ascending: false });

          const mapped: DisplayPanel[] = (data ?? []).map((p) => ({
            ...p,
            name: p.subdomain || p.id,
          }));
          setPanels(mapped);

          if ((data?.length ?? 0) === 0) {
            try {
              const { data: session } = await supabase.auth.getSession();
              const partnerId = session.session?.user.user_metadata?.partner_id;
              if (partnerId) {
                const demo = await provisionDemoPanel(partnerId);
                setPanels([{ ...demo, name: demo.name, status: demo.status ?? 'unknown', created_at: new Date().toISOString() }]);
              }
            } catch {
              // Panel provisioning may fail — show empty state
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load panels');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading panels...</p>;
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Panels</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Panels</h2>
      </div>
      {panels.length === 0 ? (
        <p className="text-gray-500">No panels yet.</p>
      ) : (
        <div className="grid gap-4">
          {panels.map((panel) => (
            <div key={panel.id}>
              <Link
                href={`/dashboard/panels/${panel.id}`}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900">{panel.name}</h3>
                <p className="text-sm text-gray-500">Status: {panel.status}</p>
              </Link>
              <ul className="mt-2 ml-4 space-y-1 text-sm">
                <li>
                  <Link
                    href={`/dashboard/panels/${panel.id}/services`}
                    className="text-green-700 hover:underline"
                  >
                    Services & Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/dashboard/panels/${panel.id}/branding`}
                    className="text-green-700 hover:underline"
                  >
                    Branding
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/dashboard/panels/${panel.id}/copy`}
                    className="text-green-700 hover:underline"
                  >
                    Copy & Content
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/dashboard/panels/${panel.id}/domain`}
                    className="text-green-700 hover:underline"
                  >
                    Custom Domain
                  </Link>
                </li>
                <li>
                  <PublishButton panelId={panel.id} />
                </li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
