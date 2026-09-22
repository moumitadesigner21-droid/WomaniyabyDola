CREATE TABLE cashfree_payment_attempts (
  payment_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  status TEXT NOT NULL,
  amount REAL,
  currency TEXT,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_cashfree_attempt_order ON cashfree_payment_attempts(order_id);
CREATE TABLE order_notification_claims (
  order_id TEXT NOT NULL REFERENCES orders(id),
  channel TEXT NOT NULL,
  claimed_at TEXT NOT NULL,
  PRIMARY KEY(order_id, channel)
);
