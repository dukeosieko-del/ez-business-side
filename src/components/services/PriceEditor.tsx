'use client';

import { useState } from 'react';

interface PriceEditorProps {
  basePrice: number;
  markupPercent: number;
  onPriceChange: (price: number) => void;
}

export default function PriceEditor({
  basePrice,
  markupPercent,
  onPriceChange,
}: PriceEditorProps) {
  const [localMarkup, setLocalMarkup] = useState(markupPercent);
  const calculated = Math.round(basePrice * (1 + localMarkup / 100));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Base price:</span>
        <span className="text-sm font-mono">{basePrice.toFixed(0)} KES</span>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-500 whitespace-nowrap">Markup:</label>
        <input
          type="range"
          min={0}
          max={200}
          value={localMarkup}
          onChange={(e) => setLocalMarkup(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm font-mono w-16 text-right">{localMarkup}%</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
        <span className="text-sm font-medium">Child price:</span>
        <span className="text-lg font-bold text-green-700">{calculated.toFixed(0)} KES</span>
      </div>
      <button
        type="button"
        onClick={() => onPriceChange(calculated)}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
      >
        Set Price
      </button>
    </div>
  );
}
