import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const databaseUrl = process.env.DATABASE_URL || "file:./data/rate-my-bean.db";
if (databaseUrl.startsWith("file:")) {
  const filePath = databaseUrl.replace("file:", "");
  const dirPath = path.isAbsolute(filePath)
    ? path.dirname(filePath)
    : path.join(process.cwd(), path.dirname(filePath));
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const db = createClient({
  url: databaseUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

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

async function hasColumn(table, column) {
  const res = await db.execute(`PRAGMA table_info(${table})`);
  return res.rows.some((row) => row.name === column);
}

const initPromise = (async () => {
  await db.batch([
    {
      sql: `
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
    `,
    },
    {
      sql: `
      CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bean_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        notes TEXT,
        price_paid REAL,
        created_by TEXT,
        bag_image BLOB,
        bag_image_type TEXT,
        coffee_image BLOB,
        coffee_image_type TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (bean_id) REFERENCES beans (id) ON DELETE CASCADE
      );
    `,
    },
    {
      sql: `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        image TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
    },
    {
      sql: `
      CREATE TABLE IF NOT EXISTS country_regions (
        country TEXT NOT NULL,
        region TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (country, region)
      );
    `,
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_ratings_bean_id ON ratings (bean_id);",
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_beans_origin ON beans (origin_country, origin_region);",
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);",
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_country_regions_country ON country_regions (country);",
    },
  ]);

  if (!(await hasColumn("beans", "created_by"))) {
    await db.execute("ALTER TABLE beans ADD COLUMN created_by TEXT");
  }
  if (!(await hasColumn("beans", "roaster_url"))) {
    await db.execute("ALTER TABLE beans ADD COLUMN roaster_url TEXT");
  }
  if (!(await hasColumn("beans", "bag_image"))) {
    await db.execute("ALTER TABLE beans ADD COLUMN bag_image BLOB");
  }
  if (!(await hasColumn("beans", "bag_image_type"))) {
    await db.execute("ALTER TABLE beans ADD COLUMN bag_image_type TEXT");
  }
  if (!(await hasColumn("beans", "coffee_image"))) {
    await db.execute("ALTER TABLE beans ADD COLUMN coffee_image BLOB");
  }
  if (!(await hasColumn("beans", "coffee_image_type"))) {
    await db.execute("ALTER TABLE beans ADD COLUMN coffee_image_type TEXT");
  }

  if (!(await hasColumn("ratings", "created_by"))) {
    await db.execute("ALTER TABLE ratings ADD COLUMN created_by TEXT");
  }
  if (!(await hasColumn("ratings", "bag_image"))) {
    await db.execute("ALTER TABLE ratings ADD COLUMN bag_image BLOB");
  }
  if (!(await hasColumn("ratings", "bag_image_type"))) {
    await db.execute("ALTER TABLE ratings ADD COLUMN bag_image_type TEXT");
  }
  if (!(await hasColumn("ratings", "coffee_image"))) {
    await db.execute("ALTER TABLE ratings ADD COLUMN coffee_image BLOB");
  }
  if (!(await hasColumn("ratings", "coffee_image_type"))) {
    await db.execute("ALTER TABLE ratings ADD COLUMN coffee_image_type TEXT");
  }

  if (!(await hasColumn("users", "image"))) {
    await db.execute("ALTER TABLE users ADD COLUMN image TEXT");
  }

  const regionCount = await db.execute(
    "SELECT COUNT(*) AS count FROM country_regions"
  );
  if (!regionCount.rows[0]?.count) {
    const batch = regionSeed.map(([country, region]) => ({
      sql: "INSERT INTO country_regions (country, region, count) VALUES (?, ?, 0)",
      args: [country, region],
    }));
    await db.batch(batch);
  }
})();

async function ensureInit() {
  await initPromise;
}

export async function createBean(data) {
  await ensureInit();
  const result = await db.execute({
    sql: `
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
    `,
    args: [
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
      data.coffeeImageType || null,
    ],
  });

  if (data.originCountry && data.originRegion) {
    await db.execute({
      sql: `
        INSERT INTO country_regions (country, region, count)
        VALUES (?, ?, 1)
        ON CONFLICT(country, region)
        DO UPDATE SET count = count + 1
      `,
      args: [data.originCountry, data.originRegion],
    });
  }

  return Number(result.lastInsertRowid);
}

export async function addRating(beanId, data) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      INSERT INTO ratings (
        bean_id,
        score,
        notes,
        price_paid,
        created_by,
        bag_image,
        bag_image_type,
        coffee_image,
        coffee_image_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      beanId,
      data.score,
      data.notes || null,
      data.pricePaid ?? null,
      data.createdBy || null,
      data.bagImage || null,
      data.bagImageType || null,
      data.coffeeImage || null,
      data.coffeeImageType || null,
    ],
  });

  return Number(result.lastInsertRowid);
}

export async function getBeans() {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT
        b.id,
        b.name,
        b.roaster,
        b.origin_country,
        b.origin_region,
        b.blend,
        b.process,
        b.roast_level,
        b.price_usd,
        b.flavor_notes,
        b.created_at,
        AVG(r.score) AS avg_score,
        COUNT(r.id) AS rating_count
      FROM beans b
      LEFT JOIN ratings r ON r.bean_id = b.id
      GROUP BY b.id
      ORDER BY COALESCE(avg_score, 0) DESC, b.created_at DESC
    `,
  });
  return result.rows;
}

export async function getBeanById(id) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT
        b.id,
        b.name,
        b.roaster,
        b.roaster_url,
        b.origin_country,
        b.origin_region,
        b.blend,
        b.process,
        b.roast_level,
        b.price_usd,
        b.flavor_notes,
        b.created_by,
        b.bag_image_type,
        b.coffee_image_type,
        b.created_at,
        AVG(r.score) AS avg_score,
        COUNT(r.id) AS rating_count
      FROM beans b
      LEFT JOIN ratings r ON r.bean_id = b.id
      WHERE b.id = ?
      GROUP BY b.id
    `,
    args: [id],
  });
  return result.rows[0] || null;
}

export async function getBeanImagesById(id) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT
        bag_image,
        bag_image_type,
        coffee_image,
        coffee_image_type
      FROM beans
      WHERE id = ?
    `,
    args: [id],
  });
  return result.rows[0] || null;
}

export async function getRatingsForBean(id) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT
        id,
        bean_id,
        score,
        notes,
        price_paid,
        created_at,
        bag_image_type,
        coffee_image_type
      FROM ratings
      WHERE bean_id = ?
      ORDER BY created_at DESC
    `,
    args: [id],
  });
  return result.rows;
}

export async function getTopRegions(limit = 5) {
  await ensureInit();
  const result = await db.execute({
    sql: `
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
    `,
    args: [limit],
  });
  return result.rows;
}

export async function upsertUser(data) {
  await ensureInit();
  const email = data.email || null;
  if (!email) return;

  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
    args: [email],
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql: `
        UPDATE users
        SET name = ?, image = ?
        WHERE email = ?
      `,
      args: [data.name || null, data.image || null, email],
    });
    return;
  }

  await db.execute({
    sql: `
      INSERT INTO users (id, email, name, image)
      VALUES (?, ?, ?, ?)
    `,
    args: [data.id, email, data.name || null, data.image || null],
  });
}

export async function getStats() {
  await ensureInit();
  const beanCountRes = await db.execute(
    "SELECT COUNT(*) AS count FROM beans"
  );
  const ratingRes = await db.execute(
    "SELECT COUNT(*) AS count, AVG(score) AS avg_score FROM ratings"
  );

  return {
    beanCount: beanCountRes.rows[0]?.count || 0,
    ratingCount: ratingRes.rows[0]?.count || 0,
    avgScore: ratingRes.rows[0]?.avg_score || 0,
  };
}

export async function getBeanFieldSuggestions() {
  await ensureInit();
  const rows = await db.execute({
    sql: `
      SELECT id, name, roaster, origin_country, origin_region
      FROM beans
    `,
  });

  const unique = (values) =>
    Array.from(new Set(values.filter(Boolean).map((v) => v.trim()))).sort();

  const countryRegions = await db.execute({
    sql: `
      SELECT country, region, count
      FROM country_regions
      ORDER BY count DESC, region ASC
    `,
  });

  return {
    beans: rows.rows,
    names: unique(rows.rows.map((row) => row.name)),
    roasters: unique(rows.rows.map((row) => row.roaster)),
    originCountries: unique(rows.rows.map((row) => row.origin_country)),
    originRegions: unique(rows.rows.map((row) => row.origin_region)),
    countryRegions: countryRegions.rows,
  };
}

export async function getRatingImagesById(id) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT
        bag_image,
        bag_image_type,
        coffee_image,
        coffee_image_type
      FROM ratings
      WHERE id = ?
    `,
    args: [id],
  });
  return result.rows[0] || null;
}

export async function findDuplicateBean(data) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT id
      FROM beans
      WHERE
        LOWER(name) = LOWER(?)
        AND LOWER(COALESCE(roaster, '')) = LOWER(?)
        AND LOWER(origin_country) = LOWER(?)
        AND LOWER(COALESCE(origin_region, '')) = LOWER(?)
      LIMIT 1
    `,
    args: [
      data.name.trim(),
      (data.roaster || "").trim(),
      data.originCountry.trim(),
      (data.originRegion || "").trim(),
    ],
  });
  return result.rows[0] || null;
}

export async function getTables() {
  await ensureInit();
  const result = await db.execute({
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
  });
  return result.rows.map((row) => row.name);
}

export async function getTableRows(table, limit = 50) {
  await ensureInit();
  const allowed = await getTables();
  if (!allowed.includes(table)) return { columns: [], rows: [] };
  const result = await db.execute({
    sql: `SELECT * FROM ${table} LIMIT ?`,
    args: [limit],
  });
  const columns = result.columns || [];
  return { columns, rows: result.rows };
}
