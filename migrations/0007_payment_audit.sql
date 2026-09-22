CREATE TABLE cashfree_webhook_receipts (
  event_hash TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  event_type TEXT NOT NULL,
  received_at TEXT NOT NULL
);
CREATE TABLE order_stock_checks (valid INTEGER NOT NULL CONSTRAINT stock_available CHECK (valid = 1));
