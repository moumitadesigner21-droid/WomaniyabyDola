-- Cashfree payment lifecycle and inventory reservation metadata.
ALTER TABLE orders ADD COLUMN cashfree_order_id TEXT;
ALTER TABLE orders ADD COLUMN cashfree_payment_session_id TEXT;
ALTER TABLE orders ADD COLUMN cashfree_payment_id TEXT;
ALTER TABLE orders ADD COLUMN cashfree_payment_method TEXT;
ALTER TABLE orders ADD COLUMN payment_failure_reason TEXT;
ALTER TABLE orders ADD COLUMN payment_verified_at TEXT;
ALTER TABLE orders ADD COLUMN payment_updated_at TEXT;
ALTER TABLE orders ADD COLUMN inventory_reserved_until TEXT;
ALTER TABLE orders ADD COLUMN inventory_released INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_cashfree_order
  ON orders(cashfree_order_id)
  WHERE cashfree_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
