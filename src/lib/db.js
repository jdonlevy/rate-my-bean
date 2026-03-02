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
    roaster_url TEXT,
    origin_country TEXT NOT NULL,
    origin_region TEXT,
    blend INTEGER NOT NULL DEFAULT 0,
    process TEXT,
    roast_level TEXT,
    price_usd REAL,
    flavor_notes TEXT,
    created_by TEXT,
    bag_image BLOB,
    bag_image_type TEXT,
    coffee_image BLOB,
    coffee_image_type TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bean_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    notes TEXT,
    price_paid REAL,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (bean_id) REFERENCES beans (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    image TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS country_regions (
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (country, region)
  );

  CREATE INDEX IF NOT EXISTS idx_ratings_bean_id ON ratings (bean_id);
  CREATE INDEX IF NOT EXISTS idx_beans_origin ON beans (origin_country, origin_region);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
  CREATE INDEX IF NOT EXISTS idx_country_regions_country ON country_regions (country);
`);

const beanColumns = db.prepare("PRAGMA table_info(beans)").all();
if (!beanColumns.some((col) => col.name === "created_by")) {
  db.exec("ALTER TABLE beans ADD COLUMN created_by TEXT");
}
if (!beanColumns.some((col) => col.name === "roaster_url")) {
  db.exec("ALTER TABLE beans ADD COLUMN roaster_url TEXT");
}

const ratingColumns = db.prepare("PRAGMA table_info(ratings)").all();
if (!ratingColumns.some((col) => col.name === "created_by")) {
  db.exec("ALTER TABLE ratings ADD COLUMN created_by TEXT");
}

const userColumns = db.prepare("PRAGMA table_info(users)").all();
if (!userColumns.some((col) => col.name === "image")) {
  db.exec("ALTER TABLE users ADD COLUMN image TEXT");
}

if (!beanColumns.some((col) => col.name === "bag_image")) {
  db.exec("ALTER TABLE beans ADD COLUMN bag_image BLOB");
}
if (!beanColumns.some((col) => col.name === "bag_image_type")) {
  db.exec("ALTER TABLE beans ADD COLUMN bag_image_type TEXT");
}
if (!beanColumns.some((col) => col.name === "coffee_image")) {
  db.exec("ALTER TABLE beans ADD COLUMN coffee_image BLOB");
}
if (!beanColumns.some((col) => col.name === "coffee_image_type")) {
  db.exec("ALTER TABLE beans ADD COLUMN coffee_image_type TEXT");
}

const regionSeed = [
  ["Brazil", "Minas Gerais"],
  ["Brazil", "Sul de Minas"],
  ["Brazil", "Cerrado"],
  ["Colombia", "Huila"],
  ["Colombia", "Antioquia"],
  ["Colombia", "Nariño"],
  ["Colombia", "Cauca"],
  ["Colombia", "Tolima"],
  ["Ethiopia", "Yirgacheffe"],
  ["Ethiopia", "Sidamo"],
  ["Ethiopia", "Guji"],
  ["Ethiopia", "Harrar"],
  ["Kenya", "Nyeri"],
  ["Kenya", "Kirinyaga"],
  ["Kenya", "Embu"],
  ["Guatemala", "Antigua"],
  ["Guatemala", "Huehuetenango"],
  ["Guatemala", "Atitlán"],
  ["Costa Rica", "Tarrazu"],
  ["Costa Rica", "West Valley"],
  ["Costa Rica", "Central Valley"],
  ["Honduras", "Copan"],
  ["Honduras", "Santa Barbara"],
  ["El Salvador", "Apaneca-Ilamatepec"],
  ["Nicaragua", "Matagalpa"],
  ["Nicaragua", "Jinotega"],
  ["Mexico", "Chiapas"],
  ["Mexico", "Veracruz"],
  ["Peru", "Cajamarca"],
  ["Peru", "Cusco"],
  ["Rwanda", "Nyamasheke"],
  ["Rwanda", "Gakenke"],
  ["Burundi", "Kayanza"],
  ["Indonesia", "Sumatra"],
  ["Indonesia", "Java"],
  ["Indonesia", "Sulawesi"],
  ["Papua New Guinea", "Eastern Highlands"],
];

const existingRegions = db
  .prepare("SELECT COUNT(*) AS count FROM country_regions")
  .get().count;
if (!existingRegions) {
  const stmt = db.prepare(
    "INSERT INTO country_regions (country, region, count) VALUES (?, ?, 0)"
  );
  for (const [country, region] of regionSeed) {
    stmt.run(country, region);
  }
}

export function createBean(data) {
  const stmt = db.prepare(`
    INSERT INTO beans (
      name,
      roaster,
      roaster_url,
      origin_country,
      origin_region,
      blend,
      process,
      roast_level,
      price_usd,
      flavor_notes,
      created_by,
      bag_image,
      bag_image_type,
      coffee_image,
      coffee_image_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    data.name,
    data.roaster || null,
    data.roasterUrl || null,
    data.originCountry,
    data.originRegion || null,
    data.blend ? 1 : 0,
    data.process || null,
    data.roastLevel || null,
    data.priceUsd ?? null,
    data.flavorNotes || null,
    data.createdBy || null,
    data.bagImage || null,
    data.bagImageType || null,
    data.coffeeImage || null,
    data.coffeeImageType || null
  );

  if (data.originCountry && data.originRegion) {
    db.prepare(
      `
      INSERT INTO country_regions (country, region, count)
      VALUES (?, ?, 1)
      ON CONFLICT(country, region)
      DO UPDATE SET count = count + 1
    `
    ).run(data.originCountry, data.originRegion);
  }

  return info.lastInsertRowid;
}

export function addRating(beanId, data) {
  const stmt = db.prepare(`
    INSERT INTO ratings (bean_id, score, notes, price_paid, created_by)
    VALUES (?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    beanId,
    data.score,
    data.notes || null,
    data.pricePaid ?? null,
    data.createdBy || null
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
        b.bag_image_type,
        b.coffee_image_type,
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

export function getBeanImagesById(id) {
  return db
    .prepare(
      `
      SELECT
        bag_image,
        bag_image_type,
        coffee_image,
        coffee_image_type
      FROM beans
      WHERE id = ?
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

export function upsertUser(data) {
  const id = data.id || data.email;
  const email = data.email || null;
  const name = data.name || null;
  const image = data.image || null;

  const existingByEmail = email
    ? db.prepare("SELECT id FROM users WHERE email = ?").get(email)
    : null;

  if (existingByEmail) {
    db.prepare(
      `
      UPDATE users
      SET id = ?, name = ?, image = ?
      WHERE email = ?
    `
    ).run(id, name, image, email);
    return;
  }

  db.prepare(
    `
    INSERT INTO users (id, email, name, image)
    VALUES (?, ?, ?, ?)
  `
  ).run(id, email, name, image);
}

export function getStats() {
  const beanCount = db.prepare("SELECT COUNT(*) AS count FROM beans").get().count;
  const ratingData = db
    .prepare(
      `
      SELECT
        COUNT(*) AS count,
        AVG(score) AS avg_score
      FROM ratings
    `
    )
    .get();

  return {
    beanCount,
    ratingCount: ratingData.count || 0,
    avgScore: ratingData.avg_score || 0,
  };
}

export function getBeanFieldSuggestions() {
  const rows = db
    .prepare(
      `
      SELECT name, roaster, origin_country, origin_region
      FROM beans
    `
    )
    .all();

  const unique = (values) =>
    Array.from(new Set(values.filter(Boolean).map((v) => v.trim()))).sort();

  return {
    beans: rows,
    names: unique(rows.map((row) => row.name)),
    roasters: unique(rows.map((row) => row.roaster)),
    originCountries: unique(rows.map((row) => row.origin_country)),
    originRegions: unique(rows.map((row) => row.origin_region)),
    countryRegions: db
      .prepare(
        `
        SELECT country, region, count
        FROM country_regions
        ORDER BY count DESC, region ASC
      `
      )
      .all(),
  };
}

export function findDuplicateBean(data) {
  return db
    .prepare(
      `
      SELECT id
      FROM beans
      WHERE
        LOWER(name) = LOWER(?)
        AND LOWER(COALESCE(roaster, "")) = LOWER(?)
        AND LOWER(origin_country) = LOWER(?)
        AND LOWER(COALESCE(origin_region, "")) = LOWER(?)
      LIMIT 1
    `
    )
    .get(
      data.name.trim(),
      (data.roaster || "").trim(),
      data.originCountry.trim(),
      (data.originRegion || "").trim()
    );
}
