'use client';

import { PanelBranding } from '@/lib/tenant/context';

export function LivePreview({ branding }: { branding: PanelBranding }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="text-xs text-gray-500 uppercase tracking-wide px-4 py-2 bg-gray-50 border-b">
        Live Preview
      </div>
      <div
        className="p-8 min-h-[300px]"
        style={{
          backgroundColor: branding.backgroundColor,
          color: branding.textColor,
          fontFamily: branding.fontFamily,
        }}
      >
        {branding.logo && (
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={branding.logo} alt="Logo" className="max-h-12" />
          </div>
        )}
        <h2 className="text-3xl font-bold mb-3">Your Hero Title Here</h2>
        <p className="text-lg opacity-80 mb-6">Your subtitle appears here.</p>
        <button
          className="px-6 py-3 rounded-lg font-semibold text-white"
          style={{ backgroundColor: branding.primaryColor }}
        >
          Your CTA Button
        </button>
        <div
          className="mt-6 h-1 rounded"
          style={{ backgroundColor: branding.accentColor }}
        />
      </div>
    </div>
  );
}
