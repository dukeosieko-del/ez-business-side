'use client';

import { useState, useEffect } from 'react';
import { AffiliateLink } from '@/components/affiliate/AffiliateLink';
import { AffiliateStats } from '@/components/affiliate/AffiliateStats';
import { PayoutRequest } from '@/components/affiliate/PayoutRequest';

interface AffiliateData {
  id: string;
  janjez_user_id: string;
  affiliate_code: string;
  commission_rate: number;
  total_earned: number;
  total_pending: number;
  total_paid: number;
  mpesa_number: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Commission {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Click {
  id: string;
  ref_code: string;
  ip: string | null;
  clicked_at: string;
  converted_order_id: string | null;
}

interface StatsData {
  earned: number;
  pending: number;
  total_clicks: number;
  total_conversions: number;
  commission_rate: number;
  commissions: Commission[];
  recent_clicks: Click[];
}

export default function AffiliateDashboard() {
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [affiliateLoading, setAffiliateLoading] = useState(true);
  const [affiliateError, setAffiliateError] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isAffiliate, setIsAffiliate] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    async function loadAffiliate() {
      try {
        const res = await fetch('/api/affiliate/me');
        if (res.status === 404) {
          setIsAffiliate(false);
          return;
        }
        if (!res.ok) {
          setAffiliateError('Failed to load affiliate data');
          return;
        }
        const data = await res.json();
        setAffiliate(data.data);
        const base = (typeof window !== 'undefined' ? window.location.origin : '') || '';
        setLink(`${base}/?ref=${data.data.affiliate_code}`);
      } catch {
        setAffiliateError('Network error');
      } finally {
        setAffiliateLoading(false);
      }
    }
    loadAffiliate();
  }, []);

  useEffect(() => {
    if (!isAffiliate) return;
    async function loadStats() {
      try {
        const res = await fetch('/api/affiliate/stats');
        if (!res.ok) {
          setStatsError('Failed to load stats');
          return;
        }
        const data = await res.json();
        setStats(data.data ?? null);
      } catch {
        setStatsError('Network error');
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, [isAffiliate]);

  async function handleRegister() {
    setRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(false);
    try {
      const res = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || 'Registration failed');
      } else {
        setRegisterSuccess(true);
        setAffiliate(data.data.affiliate);
        setLink(data.data.link);
        setIsAffiliate(true);
      }
    } catch {
      setRegisterError('Network error');
    } finally {
      setRegistering(false);
    }
  }

  if (affiliateLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Dashboard</h1>
          {affiliate && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {affiliate.affiliate_code}
            </span>
          )}
        </div>
        {affiliateError && <p className="text-red-600 text-sm mt-2">{affiliateError}</p>}
      </div>

      {!isAffiliate ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Become an Affiliate</h3>
          <p className="text-gray-600 mb-4">Register to start earning commissions from referrals.</p>
          {registerError && <p className="text-red-600 text-sm mb-3">{registerError}</p>}
          {registerSuccess && <p className="text-green-600 text-sm mb-3">Registration successful!</p>}
          <button
            onClick={handleRegister}
            disabled={registering}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {registering ? 'Registering...' : 'Register as Affiliate'}
          </button>
        </div>
      ) : (
        <>
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Referral Link</h2>
            {link && <AffiliateLink link={link} />}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h2>
            <AffiliateStats
              stats={statsLoading ? null : { earned: stats?.earned ?? 0, pending: stats?.pending ?? 0, paid: affiliate?.total_paid ?? 0 }}
            />
            {statsError && <p className="text-red-600 text-sm mt-2">{statsError}</p>}
          </section>

          {stats && (
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Affiliate Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_clicks}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Conversions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_conversions}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Commission Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{(stats.commission_rate * 100).toFixed(0)}%</p>
                </div>
              </div>
            </section>
          )}

          {stats && stats.commissions.length > 0 && (
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.commissions.map(commission => (
                      <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{commission.order_id}</td>
                        <td className="py-3 px-4">KES {Number(commission.amount).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              commission.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : commission.status === 'pending' || commission.status === 'hold'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {commission.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(commission.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <PayoutRequest />
          </section>

          {stats && stats.recent_clicks.length > 0 && (
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Referrals</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">IP</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_clicks.map(click => (
                      <tr key={click.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{new Date(click.clicked_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{click.ip ?? '—'}</td>
                        <td className="py-3 px-4">
                          {click.converted_order_id ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Converted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
