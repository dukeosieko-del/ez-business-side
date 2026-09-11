'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { syncServices } from '@/lib/services/sync';

export default function PanelDetailPage() {
  const params = useParams();
  const panelId = params.id as string;
  const [panel, setPanel] = useState<{
    id: string;
    subdomain: string;
    status: string;
    created_at: string;
  } | null>(null);
  const [services, setServices] = useState<
    Array<{
      id: string;
      janjez_service_id: string;
      child_price: number;
      child_min_quantity: number;
      child_max_quantity: number;
      is_visible: boolean;
      custom_name: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseAdmin();
        const { data: panelData } = await supabase
          .from('child_panels')
          .select('*')
          .eq('id', panelId)
          .single();
        setPanel(panelData);

        const { data: serviceData } = await supabase
          .from('child_services')
          .select('*')
          .eq('panel_id', panelId);
        setServices(serviceData ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [panelId]);

  async function handleSync() {
    try {
      const synced = await syncServices(panelId);
      setServices((prev) => [...prev, ...synced]);
    } catch {
      // Sync will fail gracefully since Janjez API doesn't exist yet
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading panel...</p>;
  }

  if (!panel) {
    return <p className="text-red-600">Panel not found</p>;
  }

  return (
    <div>
      <Link href="/dashboard/panels" className="text-green-600 hover:underline text-sm">
        ← Back to panels
      </Link>
      <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-1">{panel.subdomain}</h2>
      <p className="text-gray-500 text-sm mb-6">Status: {panel.status}</p>

      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={handleSync}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          Sync from Janjez
        </button>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3">Services</h3>
      {services.length === 0 ? (
        <p className="text-gray-500">No services yet. Import or sync to add.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Price</th>
              <th className="py-2">Min</th>
              <th className="py-2">Max</th>
              <th className="py-2">Visible</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="py-2">{s.custom_name || s.janjez_service_id || '-'}</td>
                <td className="py-2">{s.child_price} KES</td>
                <td className="py-2">{s.child_min_quantity}</td>
                <td className="py-2">{s.child_max_quantity}</td>
                <td className="py-2">{s.is_visible ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
