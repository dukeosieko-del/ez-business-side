'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/server';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
}

export function ServiceCatalogue() {
  const { panel } = useParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('panel_id', panel);
      setServices((data ?? []) as Service[]);
      setLoading(false);
    };
    load();
  }, [panel]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Services</h1>
      <div style={{ display: 'grid', gap: '16px' }}>
        {services.map(service => (
          <div key={service.id} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <p>Price: KES {service.price} | Cost: KES {service.cost}</p>
            <a href={`/order/${service.id}`}>Order</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceCatalogue;