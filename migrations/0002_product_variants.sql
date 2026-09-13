-- Product options (e.g. Size, Colour) and per-combination variants with their
-- own stock/price/image. Products without variants keep using product-level
-- stock and the legacy `sizes` list.

ALTER TABLE products ADD COLUMN options TEXT NOT NULL DEFAULT '[]';

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT NOT NULL,                  -- deterministic from option values (stable across saves)
  product_id TEXT NOT NULL,
  option_values TEXT NOT NULL,       -- JSON object { "Size": "M", "Colour": "Red" }
  sku TEXT,
  price REAL,                        -- NULL = inherit product price
  sale_price REAL,                   -- NULL = inherit product sale price
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  in_stock INTEGER NOT NULL DEFAULT 1,
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

ALTER TABLE order_items ADD COLUMN variant_id TEXT;
ALTER TABLE order_items ADD COLUMN variant_label TEXT;
