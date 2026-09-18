'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type Affiliate } from '@/lib/types';

interface PartnerMeData {
  id: string;
  janjez_user_id: string;
  janjez_email: string;
  display_name: string;
  status: 'pending' | 'active' | 'suspended';
  onboarding_state: string;
}

interface PanelsData {
  id: string;
  partner_id: string;
  subdomain: string;
  custom_domain: string | null;
  status: string;
  created_at: string;
}

interface PartnerMeResponse {
  success: boolean;
  data: PartnerMeData;
}

interface PanelsResponse {
  success: boolean;
  data: PanelsData[];
}

interface WalletBalanceResponse {
  success: boolean;
  data: { balance: number };
}

interface AffiliateMeResponse {
  success: boolean;
  data: Affiliate;
}

interface OnboardingStatusResponse {
  valid: boolean;
  partner: string | { status: string };
}

export default function DashboardHome() {
  const [partner, setPartner] = useState<PartnerMeData | null>(null);
  const [panelCount, setPanelCount] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [activationState, setActivationState] = useState<string>('');
  const [memberSince, setMemberSince] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [partnerRes, panelsRes, walletRes, affiliateRes, onboardingRes] = await Promise.all([
          fetch('/api/partner/me'),
          fetch('/api/partner/panels'),
          fetch('/api/partner/wallet/balance'),
          fetch('/api/affiliate/me'),
          fetch('/api/partner/onboarding/status'),
        ]);

        if (partnerRes.ok) {
          const json: PartnerMeResponse = await partnerRes.json();
          if (json.success) setPartner(json.data);
        }

        if (panelsRes.ok) {
          const json: PanelsResponse = await panelsRes.json();
          if (json.success) setPanelCount(json.data.length);
        }

        if (walletRes.ok) {
          const json: WalletBalanceResponse = await walletRes.json();
          if (json.success) setWalletBalance(json.data.balance);
        }

        if (affiliateRes.ok) {
          const json: AffiliateMeResponse = await affiliateRes.json();
          if (json.success) {
            setAffiliate(json.data);
            setMemberSince(json.data.created_at);
          }
        }

        if (onboardingRes.ok) {
          const json: OnboardingStatusResponse = await onboardingRes.json();
          if (json.valid) {
            setActivationState('Ready');
          } else if (typeof json.partner === 'string') {
            setActivationState(json.partner);
          } else if (json.partner) {
            setActivationState(json.partner.status);
          } else {
            setActivationState('Unknown');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const statusBadgeClass: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  const partnerName = partner?.display_name ?? 'Partner';
  const partnerEmail = partner?.janjez_email ?? '';
  const partnerStatus = partner?.status ?? 'pending';

  function formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatCurrency(amount: number): string {
    return `KES ${amount.toLocaleString()}`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {partnerName}</h2>
        <p className="text-gray-600">{partnerEmail}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">My Panels</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{panelCount}</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Wallet Balance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(walletBalance)}</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Affiliate Earnings</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(affiliate?.total_earned ?? 0)}</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Activation Status</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{activationState || 'Loading...'}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/panels" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
            <h4 className="font-semibold text-gray-900">Reseller</h4>
            <p className="text-sm text-gray-600 mt-1">Manage your SMM panels, orders, and commissions</p>
          </Link>
          <Link href="/dashboard/affiliate" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
            <h4 className="font-semibold text-gray-900">Affiliate</h4>
            <p className="text-sm text-gray-600 mt-1">Earn KES commission on every referral</p>
          </Link>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/panels?first=1" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
            <p className="font-semibold text-gray-900">Provision new panel</p>
          </Link>
          <Link href="/dashboard/wallet" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
            <p className="font-semibold text-gray-900">View wallet</p>
          </Link>
          <Link href="/dashboard/withdrawals" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
            <p className="font-semibold text-gray-900">Request withdrawal</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Account Status</p>
          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass[partnerStatus] ?? statusBadgeClass['pending']}`}>
              {partnerStatus}
            </span>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Member Since</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{formatDate(memberSince)}</p>
          <p className="text-sm text-gray-500 mt-1">Last login: N/A</p>
        </div>
      </div>
    </div>
  );
}
