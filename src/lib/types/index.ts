export type PartnerStatus = 'pending' | 'active' | 'suspended';
export type PanelStatus = 'demo' | 'active' | 'suspended';
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'in_progress'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'cancelled'
  | 'refunded';
export type WithdrawalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'paid'
  | 'failed';
export type ChildUserStatus = 'active' | 'suspended' | 'deleted';

export interface Partner {
  id: string;
  janjez_user_id: string;
  janjez_email: string;
  display_name: string;
  phone: string;
  status: PartnerStatus;
  activation_paid_at: string | null;
  activation_amount: number;
  wallet_balance: number;
  api_key_hash: string | null;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChildPanel {
  id: string;
  partner_id: string;
  subdomain: string;
  custom_domain: string | null;
  custom_domain_verified: boolean;
  branding: Record<string, unknown>;
  copy: Record<string, unknown>;
  payment_gateways: string[];
  status: PanelStatus;
  created_at: string;
  updated_at: string;
}

export interface ChildService {
  id: string;
  panel_id: string;
  janjez_service_id: string;
  child_price: number;
  child_min_quantity: number;
  child_max_quantity: number;
  is_visible: boolean;
  is_drip_feed_enabled: boolean;
  display_order: number | null;
  custom_name: string | null;
  custom_description: string | null;
  imported_at: string;
}

export interface ChildUser {
  id: string;
  panel_id: string;
  email: string;
  password_hash: string | null;
  balance: number;
  status: ChildUserStatus;
  created_at: string;
  updated_at: string;
}

export interface ChildOrder {
  id: string;
  panel_id: string;
  child_user_id: string | null;
  service_id: string;
  janjez_order_id: string | null;
  link: string;
  quantity: number;
  charge: number;
  cost: number;
  markup: number;
  status: OrderStatus;
  provider_order_id: string | null;
  error_message: string | null;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  id: string;
  partner_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  mpesa_number: string;
  status: WithdrawalStatus;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  paid_at: string | null;
  mpesa_receipt: string | null;
  created_at: string;
  updated_at: string;
}

export interface Affiliate {
  id: string;
  janjez_user_id: string;
  affiliate_code: string;
  commission_rate: number;
  total_earned: number;
  total_pending: number;
  total_paid: number;
  mpesa_number: string | null;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface AffiliateReferral {
  id: string;
  affiliate_id: string;
  visitor_fingerprint: string | null;
  referral_source: string | null;
  converted_order_id: string | null;
  order_amount: number | null;
  commission_amount: number | null;
  status: 'pending' | 'completed' | 'cancelled' | 'clawback';
  hold_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_type: string;
  actor_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
