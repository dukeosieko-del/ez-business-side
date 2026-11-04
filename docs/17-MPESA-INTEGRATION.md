# M-Pesa integration and go-live checklist

The Business Side project must own its own Daraja credentials, callback URLs, payment intents, idempotency keys, and reconciliation. It must not call the frozen Main application's payment endpoints.

## STK deposits

Required configuration:

- `MPESA_ENV=sandbox` for testing; `production` only after Safaricom go-live approval.
- `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`.
- `MPESA_CALLBACK_TOKEN` (at least 32 random characters) and a public HTTPS callback URL.
- `MPESA_LIVE_PAYMENTS_ENABLED=true` only after explicit production go-live approval.

STK Push uses the shortcode/passkey timestamp password and the Daraja STK Push API. A callback is not accepted as proof of payment on its own; the provider status and stored intent must be reconciled before a wallet ledger entry can be made.

## B2C payouts

Safaricom B2C is an asynchronous disbursement API. It requires a B2C-enabled shortcode, initiator username, an encrypted security credential generated with the appropriate Safaricom certificate, public result and timeout URLs, and separate live go-live approval.

Required Business Side variables:

- `MPESA_B2C_INITIATOR_NAME`
- `MPESA_B2C_SECURITY_CREDENTIAL` (pre-encrypted credential; never store the plaintext initiator password)
- `MPESA_B2C_SHORTCODE`
- `MPESA_B2C_RESULT_URL`
- `MPESA_B2C_TIMEOUT_URL`

A B2C request acknowledgement is not proof that a payout completed. Only a verified result callback/reconciliation can move a withdrawal to paid. Failed payouts must restore any reserved amount exactly once.

## Current state

Activation initiation and callback settlement are deliberately paused in this branch until the callback authentication and ledger reconciliation path is fully verified. Existing automatic withdrawal approval is also fail-closed. No live STK prompt, wallet movement, or B2C payout is performed during this build.

## Safaricom go-live requirements

Safaricom states that production B2C requires an approved B2C/one-account shortcode and configured API operator; sandbox credentials and simulator data are available for testing. The API is asynchronous and returns its final result to the configured ResultURL. See the official [B2C API documentation](https://developer.safaricom.co.ke/apis/BusinessToCustomer) and [Transaction Status API](https://developer.safaricom.co.ke/apis/TransactionStatus).
