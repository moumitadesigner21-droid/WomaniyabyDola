import type Database from "better-sqlite3";

export function initCmsSchema(database: Database.Database) {
  database.exec(`
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
  `);
}
