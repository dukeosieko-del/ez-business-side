'use client';

import { useParams } from 'next/navigation';
import ImportServicesButton from '@/components/services/ImportServicesButton';
import PriceEditor from '@/components/services/PriceEditor';
import { useState } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export default function PanelServicesPage() {
  const params = useParams();
  const panelId = params.id as string;
  const [basePrice, setBasePrice] = useState(1000);
  const [markup, setMarkup] = useState(100);
  const [imported, setImported] = useState(0);

  return (
    <div>
      <p className="text-gray-500 text-sm mb-2">Panel: {panelId}</p>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Services</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-4">Import from Janjez</h3>
          <ImportServicesButton
            panelId={panelId}
            onImportComplete={(count) => setImported((prev) => prev + count)}
          />
          {imported > 0 && (
            <p className="mt-2 text-sm text-green-600">{imported} service(s) imported this session</p>
          )}
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-4">Price Editor</h3>
          <PriceEditor basePrice={basePrice} markupPercent={markup} onPriceChange={() => {}} />
          <div className="mt-4 space-y-2">
            <div>
              <label className="text-sm text-gray-500">Base Price</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Markup %</label>
              <input
                type="number"
                value={markup}
                onChange={(e) => setMarkup(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
