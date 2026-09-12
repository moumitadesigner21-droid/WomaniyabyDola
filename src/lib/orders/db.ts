import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { initCmsSchema } from "@/lib/cms/schema";
import { seedCmsFromStaticData } from "@/lib/cms/seed";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "orders.db");

let db: Database.Database | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
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
      payment_status TEXT NOT NULL DEFAULT 'COD',
      order_status TEXT NOT NULL DEFAULT 'new',
      whatsapp_notified INTEGER NOT NULL DEFAULT 0,
      whatsapp_error TEXT,
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
  `);

  initCmsSchema(database);

  const defaultOwner = process.env.OWNER_WHATSAPP_NUMBER ?? "919775301488";
  const defaultEmail =
    process.env.ORDER_NOTIFICATION_EMAIL ?? "womaniadesignstudio@gmail.com";

  const upsert = database.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING",
  );
  upsert.run("owner_whatsapp_number", defaultOwner);
  upsert.run("order_email", defaultEmail);
  upsert.run("flat_shipping_rate", "0");

  migrateOrdersTable(database);

  seedCmsFromStaticData();
}

function migrateOrdersTable(database: Database.Database) {
  const columns = database
    .prepare("PRAGMA table_info(orders)")
    .all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));

  if (!names.has("customer_whatsapp_notified")) {
    database.exec(
      "ALTER TABLE orders ADD COLUMN customer_whatsapp_notified INTEGER NOT NULL DEFAULT 0",
    );
  }
  if (!names.has("customer_whatsapp_error")) {
    database.exec("ALTER TABLE orders ADD COLUMN customer_whatsapp_error TEXT");
  }
}

export function getDb(): Database.Database {
  if (!db) {
    ensureDataDir();
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}
