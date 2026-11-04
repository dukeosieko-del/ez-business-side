# Child Panel API

Base URL: `https://business.janjez.social/api/v1/child`

The API is tenant-scoped. Every key belongs to one child user and one child panel. Keys are shown once at creation, stored as SHA-256 hashes, scoped, revocable, expiry-aware, and rate-limited per minute. Never put a secret in browser JavaScript, a mobile binary, source control, or a public issue.

## Issue and revoke keys

A signed-in child-panel user manages keys using the session-authenticated endpoints:

- `GET /api/child/api-keys` — list metadata only (never returns secrets)
- `POST /api/child/api-keys` — create a key; secret is returned once
- `DELETE /api/child/api-keys/{id}` — revoke a key

Example request:

```http
POST /api/child/api-keys
Content-Type: application/json
Cookie: jez_child_session=<browser-session>

{
  "name": "My backend integration",
  "scopes": ["services:read", "orders:create"],
  "rate_limit": 60,
  "expires_in_days": 90
}
```

Allowed scopes: `services:read`, `orders:create`. Rate limits are 1–600 requests per minute. Expiry is optional and capped at 365 days.

## Endpoints

### GET /services

Requires `services:read`. Returns published services for the key's panel only. Provider cost and internal provider identifiers are never exposed.

### POST /orders

Requires `orders:create` and an `Idempotency-Key` header. In demo mode it writes a clearly marked demo order and never charges a wallet or calls a provider. Live mode currently returns `503 LIVE_FULFILMENT_NOT_CONFIGURED` until provider fulfilment and payment settlement have passed integration tests.

## Authentication

Send the one-time key in the Authorization header:

```http
Authorization: Bearer jzb_demo_<key-id>.<secret>
```

Live keys use the `jzb_live_` prefix. Keys are bound to the panel mode at issue time; demo keys cannot be used against live panels or vice versa.

## cURL

```bash
export JANJEZ_API_KEY='jzb_demo_<key-id>.<secret>'
curl --fail-with-body \
  -H "Authorization: Bearer $JANJEZ_API_KEY" \
  https://business.janjez.social/api/v1/child/services
```

Demo order:

```bash
curl --fail-with-body -X POST \
  -H "Authorization: Bearer $JANJEZ_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{"service_id":"<service-uuid>","quantity":100,"link":"https://example.com/profile"}' \
  https://business.janjez.social/api/v1/child/orders
```

## JavaScript / TypeScript

```ts
const response = await fetch('https://business.janjez.social/api/v1/child/services', {
  headers: { Authorization: `Bearer ${process.env.JANJEZ_API_KEY}` },
});
if (!response.ok) throw new Error(await response.text());
const { data: services } = await response.json();
```

## Python

```python
import os
import requests

base = "https://business.janjez.social/api/v1/child"
headers = {"Authorization": f"Bearer {os.environ['JANJEZ_API_KEY']}"}
response = requests.get(f"{base}/services", headers=headers, timeout=20)
response.raise_for_status()
services = response.json()["data"]
```

## PHP

```php
<?php
$ch = curl_init('https://business.janjez.social/api/v1/child/services');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . getenv('JANJEZ_API_KEY')],
  CURLOPT_TIMEOUT => 20,
]);
$body = curl_exec($ch);
if ($body === false || curl_getinfo($ch, CURLINFO_RESPONSE_CODE) >= 400) {
  throw new RuntimeException(curl_error($ch) ?: $body);
}
$data = json_decode($body, true, flags: JSON_THROW_ON_ERROR);
curl_close($ch);
```

## Go

```go
req, err := http.NewRequest("GET", "https://business.janjez.social/api/v1/child/services", nil)
if err != nil { panic(err) }
req.Header.Set("Authorization", "Bearer "+os.Getenv("JANJEZ_API_KEY"))
resp, err := http.DefaultClient.Do(req)
if err != nil { panic(err) }
defer resp.Body.Close()
if resp.StatusCode >= 300 { panic(resp.Status) }
```

## Error handling

- `401`: missing, invalid, expired, or revoked key
- `403`: key lacks the required scope or panel mode does not match
- `429`: minute rate limit exceeded
- `503`: rate limiter or live provider/payment integration unavailable

All requests must use HTTPS. Rotate a key by creating a replacement, deploying it to the server-side secret store, verifying it, then revoking the old key.
