'use client';

import { useState, useEffect } from 'react';

interface StatsData {
  earned: number;
  pending: number;
  paid: number;
}

export function AffiliateStats({ stats }: { stats: StatsData | null }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Total Earned', 'Pending', 'Paid'].map(label => (
          <div key={label} className="p-6 bg-white border border-gray-200 rounded-xl">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">—</p>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Earned', value: `KES ${stats.earned.toLocaleString()}`, color: 'text-green-600' },
    { label: 'Pending', value: `KES ${stats.pending.toLocaleString()}`, color: 'text-yellow-600' },
    { label: 'Paid', value: `KES ${stats.paid.toLocaleString()}`, color: 'text-blue-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map(card => (
        <div key={card.label} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
