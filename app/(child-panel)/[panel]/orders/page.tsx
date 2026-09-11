'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { OrdersTable } from '@/components/dashboard/OrdersTable';
import { OrderFilters } from '@/components/dashboard/OrderFilters';

export default function PanelOrdersPage() {
  const { id } = useParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('panel_id', id);
      setOrders(data ?? []);
      setLoading(false);
    };
    load();
  }, [id]);

  return (
    <main style={{ padding: '24px' }}>
      <h1>Panel Orders</h1>
      <OrderFilters onFilter={() => {}} />
      {loading ? <div>Loading...</div> : <OrdersTable orders={orders} />}
    </main>
  );
}