CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  ip INET,
  user_agent TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  converted_order_id UUID,
  converted_at TIMESTAMPTZ
);

CREATE INDEX idx_affiliate_clicks_ref ON affiliate_clicks(ref_code);
CREATE INDEX idx_affiliate_clicks_fp ON affiliate_clicks(fingerprint);