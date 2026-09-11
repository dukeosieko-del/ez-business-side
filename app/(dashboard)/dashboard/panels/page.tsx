'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { provisionDemoPanel } from '@/lib/panels/provision';

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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Panels</h2>
      {panels.length === 0 ? (
        <p className="text-gray-500">No panels yet.</p>
      ) : (
        <div className="grid gap-4">
          {panels.map((panel) => (
            <Link
              key={panel.id}
              href={`/dashboard/panels/${panel.id}`}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-900">{panel.name}</h3>
              <p className="text-sm text-gray-500">Status: {panel.status}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
