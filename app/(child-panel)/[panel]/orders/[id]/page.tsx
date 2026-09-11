'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase.from('orders').select('*').eq('id', id).single();
      setOrder(data);
    };
    load();
  }, [id]);

  if (!order) return <div>Loading...</div>;

  return (
    <main style={{ padding: '24px' }}>
      <h1>Order {order.id}</h1>
      <p>Status: {order.status}</p>
      <p>Service: {order.service_name}</p>
      <p>Charge: {order.charge}</p>
      <p>Cost: {order.cost}</p>
      <p>Margin: {order.markup}</p>
    </main>
  );
}