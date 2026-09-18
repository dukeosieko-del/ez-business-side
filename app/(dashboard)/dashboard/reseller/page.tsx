'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Partner {
  id: string;
  janjez_user_id: string;
  janjez_email: string;
  display_name: string;
  status: string;
  onboarding_state: string;
  activation_amount: number;
  activation_paid_at: string | null;
  wallet_balance: number;
}

interface Panel {
  id: string;
  partner_id: string;
  subdomain: string;
  status: string;
  created_at: string;
}

interface Order {
  id: string;
  panel_id: string;
  service_id: string;
  status: string;
  charge: number;
  cost: number;
  markup: number;
  created_at: string;
}

interface PanelWithOrders extends Panel {
  orders: Order[];
}

interface OrdersResponse {
  success: boolean;
  data: { orders: Order[]; total: number; page: number; limit: number };
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'active':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
    case 'demo':
      return 'bg-yellow-100 text-yellow-800';
    case 'suspended':
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString()}`;
}

export default function ResellerPage() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partnerLoading, setPartnerLoading] = useState(true);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  const [panels, setPanels] = useState<PanelWithOrders[]>([]);
  const [panelsLoading, setPanelsLoading] = useState(true);
  const [panelsError, setPanelsError] = useState<string | null>(null);

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  const loadPartner = useCallback(async () => {
    try {
      const res = await fetch('/api/partner/me');
      if (!res.ok) throw new Error('Failed to load partner');
      const json = await res.json();
      if (json.success) {
        setPartner(json.data);
      } else {
        setPartnerError(json.error?.message || 'Failed to load partner');
      }
    } catch (err) {
      setPartnerError(err instanceof Error ? err.message : 'Failed to load partner');
    } finally {
      setPartnerLoading(false);
    }
  }, []);

  const loadWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/partner/wallet/balance');
      if (!res.ok) throw new Error('Failed to load balance');
      const json = await res.json();
      if (json.success) {
        setWalletBalance(json.data.balance ?? 0);
      }
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'Failed to load balance');
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const loadPanels = useCallback(async () => {
    try {
      const res = await fetch('/api/partner/panels');
      if (!res.ok) throw new Error('Failed to load panels');
      const json = await res.json();
      if (json.success) {
        const panelList: Panel[] = json.data ?? [];
        const panelsWithOrders = await Promise.all(
          panelList.map(async (panel) => {
            try {
              const orderRes = await fetch(`/api/partner/panels/${panel.id}/orders`);
              if (orderRes.ok) {
                const orderJson: OrdersResponse = await orderRes.json();
                return { ...panel, orders: orderJson.data?.orders ?? [] };
              }
            } catch {
              // ignore order fetch errors
            }
            return { ...panel, orders: [] };
          })
        );
        setPanels(panelsWithOrders);
      } else {
        setPanelsError(json.error?.message || 'Failed to load panels');
      }
    } catch (err) {
      setPanelsError(err instanceof Error ? err.message : 'Failed to load panels');
    } finally {
      setPanelsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPartner();
    loadWallet();
    loadPanels();
  }, [loadPartner, loadWallet, loadPanels]);

  const totalOrders = panels.reduce((sum, p) => sum + p.orders.length, 0);
  const pendingOrders = panels.reduce(
    (sum, p) => sum + p.orders.filter((o) => o.status === 'pending' || o.status === 'processing').length,
    0,
  );
  const completedOrders = panels.reduce(
    (sum, p) => sum + p.orders.filter((o) => o.status === 'completed' || o.status === 'partial').length,
    0,
  );
  const processingOrders = panels.reduce(
    (sum, p) => sum + p.orders.filter((o) => o.status === 'in_progress').length,
    0,
  );
  const totalCommission = panels.reduce((sum, p) => sum + p.orders.reduce((s, o) => s + (o.markup ?? 0), 0), 0);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/dashboard" className="text-green-600 hover:underline">
              Dashboard
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/dashboard/reseller" className="text-green-600 hover:underline">
              Reseller
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">My Panels</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reseller Dashboard</h1>

      {partnerLoading && panelsLoading && walletLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading reseller data...</p>
        </div>
      ) : null}

      {partnerError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{partnerError}</p>
        </div>
      )}

      {panelsError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{panelsError}</p>
        </div>
      )}

      {partner && (
        <section className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Partner Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Display Name</p>
              <p className="text-lg font-medium text-gray-900">{partner.display_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium text-gray-900">{partner.janjez_email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass(partner.status)}`}>
                {partner.status ?? 'unknown'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Onboarding</p>
              <p className="text-lg font-medium text-gray-900">{partner.onboarding_state || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Activation Fee</p>
              <p className="text-lg font-medium text-gray-900">
                KES 1,499 —{' '}
                {partner.activation_paid_at ? (
                  <span className="text-green-600">Paid</span>
                ) : (
                  <span className="text-red-600">Unpaid</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Wallet Balance</p>
              {walletLoading ? (
                <p className="text-lg font-medium text-gray-900">Loading...</p>
              ) : walletError ? (
                <p className="text-lg font-medium text-red-600">{walletError}</p>
              ) : (
                <p className="text-lg font-medium text-gray-900">{formatCurrency(walletBalance)}</p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Panels</h2>
        </div>
        {panelsLoading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-500">Loading panels...</p>
          </div>
        ) : panels.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow text-center">
            <p className="text-gray-500">No panels yet. Click below to add your first panel.</p>
            <div className="mt-4">
              <Link
                href="/dashboard/panels?first=1"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Add New Panel
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {panels.map((panel) => (
              <div key={panel.id} className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{panel.subdomain}</h3>
                    <p className="text-sm text-gray-500">Created: {formatDate(panel.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass(panel.status)}`}>
                      {panel.status ?? 'unknown'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Pending</p>
                    <p className="font-semibold text-gray-900">
                      {panel.orders.filter((o) => o.status === 'pending').length}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Processing</p>
                    <p className="font-semibold text-gray-900">
                      {panel.orders.filter((o) => o.status === 'processing' || o.status === 'in_progress').length}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Completed</p>
                    <p className="font-semibold text-gray-900">
                      {panel.orders.filter((o) => o.status === 'completed' || o.status === 'partial').length}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/panels/${panel.id}`}
                    className="inline-block bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    View Panel
                  </Link>
                  <Link
                    href={`/dashboard/panels/${panel.id}/services`}
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Manage Services
                  </Link>
                  <Link
                    href={`/dashboard/panels/${panel.id}/branding`}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Edit Branding
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalOrders}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-yellow-600">{pendingOrders} pending</span> ·{' '}
            <span className="text-blue-600">{processingOrders} processing</span> ·{' '}
            <span className="text-green-600">{completedOrders} completed</span>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Commission from Panels</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalCommission)}</p>
          <p className="mt-2 text-sm text-gray-500">Total earned across all panels</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Panels</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{panels.length}</p>
          <p className="mt-2 text-sm text-gray-500">Active reseller panels</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/panels?first=1"
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-center"
          >
            <p className="text-2xl mb-2">➕</p>
            <p className="font-semibold text-gray-900">Add New Panel</p>
            <p className="text-sm text-gray-500 mt-1">Create a new reseller panel</p>
          </Link>
          <Link
            href={panels.length > 0 ? `/dashboard/panels/${panels[0].id}/services` : '/dashboard/panels?first=1'}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-center"
          >
            <p className="text-2xl mb-2">📦</p>
            <p className="font-semibold text-gray-900">Import Services</p>
            <p className="text-sm text-gray-500 mt-1">Import services from Janjez</p>
          </Link>
          <button
            type="button"
            onClick={async () => {
              for (const panel of panels) {
                try {
                  await fetch(`/api/partner/panels/${panel.id}/sync`, { method: 'POST' });
                } catch {
                  // ignore sync errors
                }
              }
            }}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-center cursor-pointer"
          >
            <p className="text-2xl mb-2">🔄</p>
            <p className="font-semibold text-gray-900">Sync Orders</p>
            <p className="text-sm text-gray-500 mt-1">Sync orders for all panels</p>
          </button>
        </div>
      </section>
    </div>
  );
}
