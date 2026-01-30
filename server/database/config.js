const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'loyalty.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

// Plan schema: stores, admins, users, histories, points
db.exec(`
  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    fullname TEXT,
    phone TEXT,
    company TEXT,
    timestamp INTEGER,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    UNIQUE(store_id, email)
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    fullname TEXT,
    phone TEXT,
    country_code TEXT,
    points REAL DEFAULT 0,
    timestamp INTEGER,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    UNIQUE(store_id, email)
  );

  CREATE TABLE IF NOT EXISTS histories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    store_id TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp INTEGER,
    by TEXT,
    point REAL,
    amount REAL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
  );

  CREATE TABLE IF NOT EXISTS points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp INTEGER,
    point REAL,
    by TEXT,
    to_user TEXT,
    amount REAL,
    FOREIGN KEY (store_id) REFERENCES stores(id)
  );
`);

// Vendor/customer loyalty (for vendor dashboard, QR join, manual add)
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    points_per_dollar REAL DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    fullname TEXT,
    email TEXT,
    created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS balances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    vendor_id TEXT NOT NULL,
    points REAL DEFAULT 0,
    UNIQUE(customer_id, vendor_id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
  );
  CREATE TABLE IF NOT EXISTS shared_pool (
    customer_id TEXT PRIMARY KEY,
    points REAL DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    vendor_id TEXT NOT NULL,
    type TEXT NOT NULL,
    points REAL NOT NULL,
    amount REAL,
    processed_by TEXT,
    timestamp INTEGER,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
  );
`);
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_balances_customer ON balances(customer_id);
  CREATE INDEX IF NOT EXISTS idx_balances_vendor ON balances(vendor_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_vendor ON transactions(vendor_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
`);
const setDefault = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
setDefault.run('shared_rewards_pct', '20');

// Seed default store and first admin if none exist
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const storeCount = db.prepare('SELECT COUNT(*) as c FROM stores').get().c;
if (storeCount === 0) {
  const storeId = uuidv4();
  db.prepare('INSERT INTO stores (id, name, created_at) VALUES (?, ?, ?)').run(storeId, 'Default Store', Math.floor(Date.now() / 1000) * 1000);
}

const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get().c;
if (adminCount === 0) {
  const storeRow = db.prepare('SELECT id FROM stores LIMIT 1').get();
  const adminId = uuidv4();
  const hash = bcrypt.hashSync('Admin123!', 10);
  db.prepare(`
    INSERT INTO admins (id, store_id, email, password, fullname, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(adminId, storeRow.id, 'admin@dfba.org', hash, 'Admin', Date.now());
}

const vendorCount = db.prepare('SELECT COUNT(*) as c FROM vendors').get().c;
if (vendorCount === 0) {
  const vendorId = uuidv4();
  const vendorHash = bcrypt.hashSync('Vendor123!', 10);
  db.prepare(`
    INSERT INTO vendors (id, name, email, password, phone, address, points_per_dollar, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)
  `).run(vendorId, 'Demo Vendor', 'vendor@store.com', vendorHash, '', '', Date.now());
}

module.exports = db;
