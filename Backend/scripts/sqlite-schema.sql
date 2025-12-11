PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','logistics','field','viewer')),
  organization TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  organization TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  warehouseId TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  transport TEXT,
  organization TEXT NOT NULL,
  FOREIGN KEY (warehouseId) REFERENCES warehouses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  sourceId TEXT NOT NULL,
  destination TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  transport TEXT,
  status TEXT NOT NULL CHECK(status IN ('pending','in-transit','delayed','delivered')),
  organization TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sourceId) REFERENCES warehouses(id)
);
