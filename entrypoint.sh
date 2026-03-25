#!/bin/sh
set -e
echo "Running DB migrations..."
node -e "
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = (process.env.DATABASE_URL || 'file:/data/db/floorplanner.db').replace('file:', '');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

sqlite.exec(\`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    pdf_path TEXT,
    pdf_width_px INTEGER,
    pdf_height_px INTEGER,
    cal_x1 REAL,
    cal_y1 REAL,
    cal_x2 REAL,
    cal_y2 REAL,
    cal_real_cm REAL,
    pixels_per_cm REAL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS furniture_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width_cm REAL NOT NULL,
    height_cm REAL NOT NULL,
    color TEXT NOT NULL DEFAULT '#93c5fd',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS layouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS placements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    layout_id INTEGER NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
    furniture_item_id INTEGER NOT NULL REFERENCES furniture_items(id) ON DELETE CASCADE,
    x_px REAL NOT NULL,
    y_px REAL NOT NULL,
    rotation_deg REAL NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
\`);

console.log('Database tables created/verified successfully.');
sqlite.close();
"
echo "Starting server..."
exec node server.js
