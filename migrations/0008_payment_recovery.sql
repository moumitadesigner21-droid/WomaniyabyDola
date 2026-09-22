ALTER TABLE orders ADD COLUMN reconciliation_next_at TEXT;
ALTER TABLE orders ADD COLUMN reconciliation_attempts INTEGER NOT NULL DEFAULT 0;
CREATE INDEX orders_reconciliation_due ON orders(reconciliation_next_at, inventory_reserved_until);
CREATE TABLE payment_notification_jobs (
  order_id TEXT NOT NULL REFERENCES orders(id),
  channel TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  next_at TEXT NOT NULL,
  lease_token TEXT,
  last_error TEXT,
  PRIMARY KEY(order_id, channel)
);
CREATE INDEX payment_notification_due ON payment_notification_jobs(state, next_at);
