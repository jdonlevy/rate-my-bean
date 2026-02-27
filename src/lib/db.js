import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "rate-my-bean.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS beans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    roaster TEXT,
    origin_country TEXT NOT NULL,
    origin_region TEXT,
    blend INTEGER NOT NULL DEFAULT 0,
    process TEXT,
    roast_level TEXT,
    price_usd REAL,
    flavor_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bean_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    notes TEXT,
    price_paid REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (bean_id) REFERENCES beans (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_ratings_bean_id ON ratings (bean_id);
  CREATE INDEX IF NOT EXISTS idx_beans_origin ON beans (origin_country, origin_region);
`);

export function createBean(data) {
  const stmt = db.prepare(`
    INSERT INTO beans (
      name,
      roaster,
      origin_country,
      origin_region,
      blend,
      process,
      roast_level,
      price_usd,
      flavor_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    data.name,
    data.roaster || null,
    data.originCountry,
    data.originRegion || null,
    data.blend ? 1 : 0,
    data.process || null,
    data.roastLevel || null,
    data.priceUsd ?? null,
    data.flavorNotes || null
  );

  return info.lastInsertRowid;
}

export function addRating(beanId, data) {
  const stmt = db.prepare(`
    INSERT INTO ratings (bean_id, score, notes, price_paid)
    VALUES (?, ?, ?, ?)
  `);

  const info = stmt.run(
    beanId,
    data.score,
    data.notes || null,
    data.pricePaid ?? null
  );

  return info.lastInsertRowid;
}

export function getBeans() {
  return db
    .prepare(
      `
      SELECT
        b.*,
        AVG(r.score) AS avg_score,
        COUNT(r.id) AS rating_count
      FROM beans b
      LEFT JOIN ratings r ON r.bean_id = b.id
      GROUP BY b.id
      ORDER BY COALESCE(avg_score, 0) DESC, b.created_at DESC
    `
    )
    .all();
}

export function getBeanById(id) {
  return db
    .prepare(
      `
      SELECT
        b.*,
        AVG(r.score) AS avg_score,
        COUNT(r.id) AS rating_count
      FROM beans b
      LEFT JOIN ratings r ON r.bean_id = b.id
      WHERE b.id = ?
      GROUP BY b.id
    `
    )
    .get(id);
}

export function getRatingsForBean(id) {
  return db
    .prepare(
      `
      SELECT *
      FROM ratings
      WHERE bean_id = ?
      ORDER BY created_at DESC
    `
    )
    .all(id);
}

export function getTopRegions(limit = 5) {
  return db
    .prepare(
      `
      SELECT
        b.origin_country,
        b.origin_region,
        AVG(r.score) AS avg_score,
        COUNT(r.id) AS rating_count
      FROM beans b
      JOIN ratings r ON r.bean_id = b.id
      GROUP BY b.origin_country, b.origin_region
      HAVING rating_count >= 1
      ORDER BY avg_score DESC, rating_count DESC
      LIMIT ?
    `
    )
    .all(limit);
}
