-- Hard cap configuration
-- Run this SQL in Supabase SQL Editor to initialize the hard cap:

INSERT INTO mc_system_config (key, value, description)
VALUES (
  'hard_cap',
  '{"amount": 500000, "currency": "USDT", "enabled": true}',
  'Maximum total capital raised. Deposits are disabled when this cap is reached.'
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = now();
