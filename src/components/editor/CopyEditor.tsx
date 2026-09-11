'use client';

import { useState } from 'react';
import { PanelCopy } from '@/lib/tenant/context';

const FIELDS: Array<{
  key: keyof PanelCopy;
  label: string;
  maxLength: number;
  multiline?: boolean;
}> = [
  { key: 'heroTitle', label: 'Hero Title', maxLength: 100 },
  { key: 'heroSubtitle', label: 'Hero Subtitle', maxLength: 200, multiline: true },
  { key: 'ctaText', label: 'CTA Button Text', maxLength: 30 },
  { key: 'footerText', label: 'Footer Text', maxLength: 100 },
  { key: 'metaTitle', label: 'SEO Title', maxLength: 60 },
  { key: 'metaDescription', label: 'SEO Description', maxLength: 160, multiline: true },
];

export function CopyEditor({
  panelId,
  initialCopy,
}: {
  panelId: string;
  initialCopy: PanelCopy;
}) {
  const [copy, setCopy] = useState<PanelCopy>(initialCopy);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`/api/partner/panels/${panelId}/copy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {FIELDS.map((field) => (
        <div key={field.key} className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {field.label}
          </label>
          {field.multiline ? (
            <textarea
              value={copy[field.key]}
              onChange={(e) => setCopy({ ...copy, [field.key]: e.target.value })}
              maxLength={field.maxLength}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          ) : (
            <input
              type="text"
              value={copy[field.key]}
              onChange={(e) => setCopy({ ...copy, [field.key]: e.target.value })}
              maxLength={field.maxLength}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          )}
          <div className="text-xs text-gray-500 mt-1">
            {copy[field.key].length} / {field.maxLength}
          </div>
        </div>
      ))}

      {error && <div className="text-sm text-red-600">{error}</div>}
      {saved && <div className="text-sm text-green-600">Changes saved.</div>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Copy'}
      </button>
    </div>
  );
}
