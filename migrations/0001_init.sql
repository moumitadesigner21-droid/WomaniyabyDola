-- Womania by Dola — initial D1 schema.
-- Mirrors the former better-sqlite3 schema (src/lib/orders/db.ts + src/lib/cms/schema.ts)
-- plus the admin_users table for in-app password management.

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,   -- pbkdf2$<iterations>$<salt-b64>$<hash-b64>
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT,
  notes TEXT,
  subtotal REAL NOT NULL,
  shipping REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  coupon_code TEXT,
  payment_status TEXT NOT NULL DEFAULT 'COD',
  order_status TEXT NOT NULL DEFAULT 'new',
  whatsapp_notified INTEGER NOT NULL DEFAULT 0,
  whatsapp_error TEXT,
  customer_whatsapp_notified INTEGER NOT NULL DEFAULT 0,
  customer_whatsapp_error TEXT,
  email_notified INTEGER NOT NULL DEFAULT 0,
  email_error TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_id TEXT,
  slug TEXT,
  name TEXT NOT NULL,
  size TEXT,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_slug TEXT NOT NULL,
  subcategory_slug TEXT,
  price REAL NOT NULL,
  sale_price REAL,
  sku TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  in_stock INTEGER NOT NULL DEFAULT 1,
  enabled INTEGER NOT NULL DEFAULT 1,
  featured INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 0,
  is_bestseller INTEGER NOT NULL DEFAULT 0,
  on_sale INTEGER NOT NULL DEFAULT 0,
  badge_text TEXT,
  fabric TEXT,
  color TEXT,
  care_instructions TEXT,
  dimensions TEXT,
  custom_size_note TEXT,
  image TEXT NOT NULL,
  hover_image TEXT,
  image_position TEXT,
  portrait INTEGER NOT NULL DEFAULT 0,
  card_background TEXT,
  highlights TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  sizes TEXT NOT NULL DEFAULT '[]',
  colors TEXT NOT NULL DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  video_url TEXT,
  pallu_image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  image_type TEXT NOT NULL DEFAULT 'gallery',
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  seo_title TEXT,
  seo_description TEXT
);

CREATE TABLE IF NOT EXISTS category_subcategories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_slug TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(category_slug, slug),
  FOREIGN KEY (category_slug) REFERENCES categories(slug) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS navigation_items (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  parent_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  location TEXT NOT NULL DEFAULT 'header'
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value REAL NOT NULL,
  min_order_value REAL NOT NULL DEFAULT 0,
  valid_from TEXT,
  valid_until TEXT,
  category_slug TEXT,
  product_id TEXT,
  free_shipping INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_enabled ON products(enabled);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- Rate-limit fallback (used only when the Workers rate-limit binding is absent).
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  hits TEXT NOT NULL,          -- JSON array of epoch-ms timestamps
  updated_at INTEGER NOT NULL
);
