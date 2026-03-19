import Database from 'better-sqlite3';

export function createTables(db) {
  // Enable WAL mode (no-op for in-memory databases)
  try {
    db.pragma('journal_mode = WAL');
  } catch (err) {
    // In-memory databases don't support WAL, that's fine
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      notes TEXT,
      lat REAL,
      lng REAL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','assigned','delivered')),
      deliver_at TEXT,
      arrived_at INTEGER,
      route_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'idle' CHECK(status IN ('idle','delivering')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL,
      stops TEXT NOT NULL,
      geometry TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at INTEGER,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','completed')),
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER UNIQUE,
      subscription TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );
  `);
}

let db;

export function getDb() {
  if (!db) {
    db = new Database(process.env.DB_PATH || 'pizza.db');
    createTables(db);
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = undefined;
  }
}
