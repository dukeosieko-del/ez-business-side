'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PublishButton({ panelId }: { panelId: string }) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`/api/partner/panels/${panelId}/publish`, {
        method: 'POST',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'Publish failed');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div>
      <button
        onClick={handlePublish}
        disabled={publishing}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        {publishing ? 'Publishing...' : 'Publish Panel'}
      </button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
