import { useState, useEffect } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { AffiliateLink } from '@/components/affiliate/AffiliateLink';

export default function AffiliateDashboard() {
  const [affiliate, setAffiliate] = useState<any>(null);
  const [link, setLink] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase.from('affiliates').select('*').single();
      setAffiliate(data);
      if (data) {
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://janjez.social';
        setLink(`${base}/?ref=${data.code}`);
      }
    };
    load();
  }, []);

  return (
    <main style={{ padding: '24px' }}>
      <h1>Affiliate Dashboard</h1>
      {affiliate ? (
        <div>
          <p>Code: {affiliate.code}</p>
          <AffiliateLink link={link} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
}