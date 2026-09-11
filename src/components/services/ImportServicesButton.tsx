'use client';

import { useState } from 'react';
import { importServices } from '@/lib/services/import';

interface ImportServicesButtonProps {
  panelId: string;
  onImportComplete?: (count: number) => void;
}

export default function ImportServicesButton({
  panelId,
  onImportComplete,
}: ImportServicesButtonProps) {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  async function handleImport() {
    setImporting(true);
    setError(null);
    try {
      const imported = await importServices(panelId);
      setCount(imported.length);
      onImportComplete?.(imported.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleImport}
        disabled={importing}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
      >
        {importing ? 'Importing...' : 'Import Services from Janjez'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {count > 0 && (
        <p className="mt-2 text-sm text-green-600">{count} service(s) imported</p>
      )}
    </div>
  );
}
