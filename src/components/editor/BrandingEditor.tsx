'use client';

import { useState } from 'react';
import { PanelBranding } from '@/lib/tenant/context';
import { ColorPicker } from './ColorPicker';
import { LogoUploader } from './LogoUploader';
import { LivePreview } from './LivePreview';

export function BrandingEditor({
  panelId,
  initialBranding,
}: {
  panelId: string;
  initialBranding: PanelBranding;
}) {
  const [branding, setBranding] = useState<PanelBranding>(initialBranding);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/partner/panels/${panelId}/branding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Section title="Colors">
          <div className="space-y-4">
            <ColorPicker
              label="Primary Color"
              value={branding.primaryColor}
              onChange={(v) => setBranding({ ...branding, primaryColor: v })}
            />
            <ColorPicker
              label="Accent Color"
              value={branding.accentColor}
              onChange={(v) => setBranding({ ...branding, accentColor: v })}
            />
            <ColorPicker
              label="Background Color"
              value={branding.backgroundColor}
              onChange={(v) => setBranding({ ...branding, backgroundColor: v })}
            />
            <ColorPicker
              label="Text Color"
              value={branding.textColor}
              onChange={(v) => setBranding({ ...branding, textColor: v })}
            />
          </div>
        </Section>

        <Section title="Logo">
          <LogoUploader
            panelId={panelId}
            currentLogo={branding.logo}
            onUpload={(url) => setBranding({ ...branding, logo: url })}
          />
        </Section>

        <Section title="Font">
          <select
            value={branding.fontFamily}
            onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="Inter">Inter</option>
            <option value="Poppins">Poppins</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Montserrat">Montserrat</option>
          </select>
        </Section>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {saved && <div className="text-sm text-green-600">Changes saved.</div>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Branding'}
        </button>
      </div>

      <div className="lg:sticky lg:top-8 self-start">
        <LivePreview branding={branding} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
