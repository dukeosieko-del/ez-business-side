# Janjez Business Side — Database Schema

## Tables

### partners
- **Nullable FK note:** `wallet_balance` defaults to 0 and is CHECK-constrained >= 0
- Activated via M-Pesa payment (KES 1,499)
- `api_key_hash` stored for API authentication with child panels

### child_panels
- **Nullable FK note:** `child_users.id` in child_orders is nullable — anonymous orders are supported where no child user account exists
- `custom_domain` is nullable — panels can operate on subdomain only
- `branding` and `copy` are JSONB with default `{}` — empty by default, populated via admin settings

### child_services
- Imported from Janjez main via API
- `UNIQUE(panel_id, janjez_service_id)` — each service once per panel

### child_users
- **Nullable:** `password_hash` — optional, social auth via SSO may not require password
- `balance` defaults to 0, CHECK >= 0

### child_orders
- **Nullable FK:** `child_user_id` references child_users(id) — nullable for anonymous orders
- `janjez_order_id` nullable until order is fulfilled
- `idempotency_key` unique constraint is partial (WHERE NOT NULL)

### withdrawal_requests
- Minimum withdrawal enforced at DB level: CHECK(amount >= 500)
- Status flow: pending → approved/rejected → processing → paid/failed

### affiliates
- `affiliate_code` CHECK constraint: `^[A-Z0-9]{6,12}$`
- Commission rate: 0-100%, default 10%
- `mpesa_number` nullable — required only for payout

### affiliate_referrals
- `converted_order_id` nullable until conversion completes
- `commission_amount` nullable until calculated
- `hold_until` nullable — pending referrals have hold period

### audit_log
- `actor_id` nullable — some actions may not have an actor (system events)
- `ip_address` and `user_agent` nullable

### idempotency_keys
- TTL-based cleanup via `cleanup_expired_idempotency()` function
