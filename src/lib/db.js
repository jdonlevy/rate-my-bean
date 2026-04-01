import { createClient } from "@libsql/client";
import crypto from "crypto";
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

const quizSeed = [
  {
    question: "Coffee beans are actually the seeds of which fruit?",
    options: ["Cherry", "Berry", "Fig", "Olive"],
    correctIndex: 0,
    fact: "Coffee beans are the seeds inside a coffee cherry.",
  },
  {
    question: "Which species is generally known for higher caffeine content?",
    options: ["Arabica", "Robusta", "Liberica", "Excelsa"],
    correctIndex: 1,
    fact: "Robusta typically contains more caffeine than Arabica.",
  },
  {
    question: "What does \"single origin\" usually mean?",
    options: [
      "Blended from multiple countries",
      "From one geographic region or farm",
      "Decaf only",
      "Roasted dark only",
    ],
    correctIndex: 1,
    fact: "Single origin coffee comes from one region, farm, or cooperative.",
  },
  {
    question: "Which roast level is generally the lightest?",
    options: ["Light", "Medium", "Medium-dark", "Dark"],
    correctIndex: 0,
    fact: "Light roasts are roasted for the least time.",
  },
  {
    question: "Espresso is a brewing method that uses:",
    options: ["Cold water", "Steam only", "High pressure", "No pressure"],
    correctIndex: 2,
    fact: "Espresso is brewed by forcing hot water through coffee under pressure.",
  },
  {
    question: "Which grind size is typical for espresso?",
    options: ["Coarse", "Medium", "Fine", "Extra coarse"],
    correctIndex: 2,
    fact: "Espresso usually uses a fine grind.",
  },
  {
    question: "Which country is the largest coffee producer?",
    options: ["Colombia", "Ethiopia", "Brazil", "Vietnam"],
    correctIndex: 2,
    fact: "Brazil is the world’s largest coffee producer.",
  },
  {
    question: "Which roast generally keeps the most origin character?",
    options: ["Light", "Medium-dark", "Dark", "French"],
    correctIndex: 0,
    fact: "Light roasts preserve more origin flavors.",
  },
  {
    question: "A \"natural\" coffee process means the beans are:",
    options: [
      "Washed with lots of water",
      "Dried inside the fruit",
      "Frozen before roasting",
      "Aged in barrels",
    ],
    correctIndex: 1,
    fact: "Natural process coffees dry with the fruit intact.",
  },
  {
    question: "Which roast typically looks the lightest in color?",
    options: ["Light", "Medium", "Medium-dark", "Dark"],
    correctIndex: 0,
    fact: "Light roasts are the palest in color.",
  },
  {
    question: "What does \"cupping\" refer to?",
    options: [
      "Grinding coffee",
      "Tasting coffee for evaluation",
      "Packaging beans",
      "Steaming milk",
    ],
    correctIndex: 1,
    fact: "Cupping is a standardized way to taste coffee.",
  },
  {
    question: "Which is a common coffee flavor note category?",
    options: ["Stone fruit", "Plastic", "Metal", "Soap"],
    correctIndex: 0,
    fact: "Stone fruit notes are common in some coffees.",
  },
  {
    question: "What is a \"blend\"?",
    options: [
      "Coffee from one farm",
      "Coffee from multiple origins combined",
      "Decaf coffee",
      "Instant coffee",
    ],
    correctIndex: 1,
    fact: "Blends combine coffees from multiple origins.",
  },
  {
    question: "Which is a typical espresso drink?",
    options: ["Latte", "Filter", "Cold brew", "Turkish"],
    correctIndex: 0,
    fact: "Lattes are espresso-based drinks.",
  },
  {
    question: "What does \"washed\" process usually involve?",
    options: [
      "Drying coffee in the fruit",
      "Removing fruit before drying",
      "Freezing beans",
      "Adding milk",
    ],
    correctIndex: 1,
    fact: "Washed coffees are depulped before drying.",
  },
  {
    question: "Which tool is commonly used for pour-over brewing?",
    options: ["AeroPress", "V60", "Moka pot", "Percolator"],
    correctIndex: 1,
    fact: "The V60 is a popular pour-over brewer.",
  },
  {
    question: "What does \"body\" refer to in coffee tasting?",
    options: ["Sweetness", "Mouthfeel", "Acidity", "Aroma"],
    correctIndex: 1,
    fact: "Body describes the weight or mouthfeel of coffee.",
  },
  {
    question: "Which term describes sour, bright flavor in coffee?",
    options: ["Bitterness", "Acidity", "Body", "Aftertaste"],
    correctIndex: 1,
    fact: "Acidity gives coffee brightness and sparkle.",
  },
  {
    question: "Which roast level often tastes the most smoky?",
    options: ["Light", "Medium", "Dark", "Light-medium"],
    correctIndex: 2,
    fact: "Dark roasts can taste smoky due to longer roasting.",
  },
  {
    question: "What is a common milk-based espresso drink?",
    options: ["Americano", "Cappuccino", "Cold brew", "Batch brew"],
    correctIndex: 1,
    fact: "Cappuccinos are espresso drinks with steamed milk.",
  },
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
        reviewer_name TEXT,
        roaster TEXT,
        roaster_url TEXT,
        roastery_id INTEGER,
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
      CREATE TABLE IF NOT EXISTS roasteries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        website TEXT,
        address TEXT,
        city TEXT,
        region TEXT,
        country TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        source TEXT NOT NULL,
        external_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (source, external_id)
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
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_index INTEGER NOT NULL,
        fact TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
    },
    {
      sql: `
      CREATE TABLE IF NOT EXISTS daily_quiz (
        quiz_date TEXT PRIMARY KEY,
        question_id INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (question_id) REFERENCES quiz_questions (id)
      );
    `,
    },
    {
      sql: `
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        quiz_date TEXT NOT NULL,
        question_id INTEGER NOT NULL,
        selected_index INTEGER NOT NULL,
        correct INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (user_id, quiz_date),
        FOREIGN KEY (question_id) REFERENCES quiz_questions (id)
      );
    `,
    },
    {
      sql: `
      CREATE TABLE IF NOT EXISTS user_beanometer (
        user_id TEXT PRIMARY KEY,
        beans_count INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
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
      sql: `
      CREATE TABLE IF NOT EXISTS bean_snake_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        display_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
    },
    {
      sql: `
      CREATE TABLE IF NOT EXISTS bean_pong_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        display_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
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
      sql: "CREATE INDEX IF NOT EXISTS idx_roasteries_location ON roasteries (latitude, longitude);",
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);",
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_quiz_answers_user ON quiz_answers (user_id, quiz_date);",
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_bean_snake_scores ON bean_snake_scores (score DESC);",
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_bean_pong_scores ON bean_pong_scores (score DESC);",
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_country_regions_country ON country_regions (country);",
    },
  ]);

  if (!(await hasColumn("beans", "created_by"))) {
    await db.execute("ALTER TABLE beans ADD COLUMN created_by TEXT");
  }
  if (!(await hasColumn("beans", "reviewer_name"))) {
    await db.execute("ALTER TABLE beans ADD COLUMN reviewer_name TEXT");
  }
  if (!(await hasColumn("beans", "roaster_url"))) {
    await db.execute("ALTER TABLE beans ADD COLUMN roaster_url TEXT");
  }
  if (!(await hasColumn("beans", "roastery_id"))) {
    await db.execute("ALTER TABLE beans ADD COLUMN roastery_id INTEGER");
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
  if (!(await hasColumn("users", "password_hash"))) {
    try {
      await db.execute("ALTER TABLE users ADD COLUMN password_hash TEXT");
    } catch (error) {
      const message = error?.message || "";
      if (!message.includes("duplicate column name")) {
        throw error;
      }
    }
  }

  try {
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_beans_roastery ON beans (roastery_id);"
    );
  } catch (error) {
    const message = error?.message || "";
    if (!message.includes("no such column")) {
      throw error;
    }
  }

  const regionCount = await db.execute(
    "SELECT COUNT(*) AS count FROM country_regions"
  );
  if (!regionCount.rows[0]?.count) {
    const batch = regionSeed.map(([country, region]) => ({
      sql: "INSERT OR IGNORE INTO country_regions (country, region, count) VALUES (?, ?, 0)",
      args: [country, region],
    }));
    await db.batch(batch);
  }

  const quizCount = await db.execute(
    "SELECT COUNT(*) AS count FROM quiz_questions"
  );
  if (!quizCount.rows[0]?.count) {
    const quizBatch = quizSeed.map((item) => ({
      sql: `
        INSERT INTO quiz_questions (
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_index,
          fact
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        item.question,
        item.options[0],
        item.options[1],
        item.options[2],
        item.options[3],
        item.correctIndex,
        item.fact,
      ],
    }));
    await db.batch(quizBatch);
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
        reviewer_name,
        roaster,
        roaster_url,
        roastery_id,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.name,
      data.reviewerName || null,
      data.roaster || null,
      data.roasterUrl || null,
      data.roasteryId || null,
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

export async function getBeans({ includeUnassigned = false } = {}) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT
        b.id,
        b.name,
        b.reviewer_name,
        b.roaster,
        b.roaster_url,
        b.roastery_id,
        ro.name AS roastery_name,
        b.origin_country,
        b.origin_region,
        b.blend,
        b.process,
        b.roast_level,
        b.price_usd,
        b.flavor_notes,
        b.bag_image_type,
        b.coffee_image_type,
        b.created_at,
        AVG(r.score) AS avg_score,
        COUNT(r.id) AS rating_count
      FROM beans b
      LEFT JOIN ratings r ON r.bean_id = b.id
      LEFT JOIN roasteries ro ON ro.id = b.roastery_id
      ${includeUnassigned ? "" : "WHERE b.roastery_id IS NOT NULL"}
      GROUP BY b.id
      ORDER BY COALESCE(avg_score, 0) DESC, b.created_at DESC
    `,
  });
  return result.rows;
}

export async function getBeansByRoasteryId(roasteryId) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT
        b.id,
        b.name,
        b.reviewer_name,
        b.roaster,
        b.roaster_url,
        b.roastery_id,
        b.origin_country,
        b.origin_region,
        b.blend,
        b.process,
        b.roast_level,
        b.price_usd,
        b.flavor_notes,
        b.bag_image_type,
        b.coffee_image_type,
        b.created_at,
        AVG(r.score) AS avg_score,
        COUNT(r.id) AS rating_count
      FROM beans b
      LEFT JOIN ratings r ON r.bean_id = b.id
      WHERE b.roastery_id = ?
      GROUP BY b.id
      ORDER BY COALESCE(avg_score, 0) DESC, b.created_at DESC
    `,
    args: [roasteryId],
  });
  return result.rows;
}

export async function upsertRoasteries(roasteries) {
  await ensureInit();
  if (!roasteries?.length) return [];
  const batch = roasteries.map((roastery) => ({
    sql: `
      INSERT INTO roasteries (
        name,
        website,
        address,
        city,
        region,
        country,
        latitude,
        longitude,
        source,
        external_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source, external_id)
      DO UPDATE SET
        name = excluded.name,
        website = COALESCE(excluded.website, roasteries.website),
        address = COALESCE(excluded.address, roasteries.address),
        city = COALESCE(excluded.city, roasteries.city),
        region = COALESCE(excluded.region, roasteries.region),
        country = COALESCE(excluded.country, roasteries.country),
        latitude = excluded.latitude,
        longitude = excluded.longitude
    `,
    args: [
      roastery.name,
      roastery.website || null,
      roastery.address || null,
      roastery.city || null,
      roastery.region || null,
      roastery.country || null,
      roastery.latitude,
      roastery.longitude,
      roastery.source,
      roastery.externalId,
    ],
  }));
  await db.batch(batch);

  const ids = await db.execute({
    sql: `
      SELECT id, source, external_id
      FROM roasteries
      WHERE source = ? AND external_id IN (${roasteries
        .map(() => "?")
        .join(",")})
    `,
    args: [roasteries[0].source, ...roasteries.map((r) => r.externalId)],
  });
  return ids.rows;
}

export async function createRoastery(data) {
  await ensureInit();
  const externalId = data.externalId || data.external_id;
  if (!externalId) {
    throw new Error("externalId is required");
  }
  await db.execute({
    sql: `
      INSERT INTO roasteries (
        name,
        website,
        address,
        city,
        region,
        country,
        latitude,
        longitude,
        source,
        external_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.name,
      data.website || null,
      data.address || null,
      data.city || null,
      data.region || null,
      data.country || null,
      data.latitude,
      data.longitude,
      data.source,
      externalId,
    ],
  });
  const result = await db.execute({
    sql: `
      SELECT
        id,
        name,
        website,
        address,
        city,
        region,
        country,
        latitude,
        longitude
      FROM roasteries
      WHERE source = ? AND external_id = ?
      LIMIT 1
    `,
    args: [data.source, externalId],
  });
  return result.rows[0] || null;
}

export async function getRoasteriesByBounds({ south, west, north, east }) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT
        id,
        name,
        website,
        address,
        city,
        region,
        country,
        latitude,
        longitude
      FROM roasteries
      WHERE latitude BETWEEN ? AND ?
        AND longitude BETWEEN ? AND ?
      ORDER BY name ASC
    `,
    args: [south, north, west, east],
  });
  return result.rows;
}

export async function getRoasteryById(id) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT
        id,
        name,
        website,
        address,
        city,
        region,
        country,
        latitude,
        longitude
      FROM roasteries
      WHERE id = ?
      LIMIT 1
    `,
    args: [id],
  });
  return result.rows[0] || null;
}

export async function getBeanById(id) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT
        b.id,
        b.name,
        b.reviewer_name,
        b.roaster,
        b.roaster_url,
        b.roastery_id,
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
        ro.name AS roastery_name,
        ro.website AS roastery_website,
        ro.city AS roastery_city,
        ro.region AS roastery_region,
        ro.country AS roastery_country,
        AVG(r.score) AS avg_score,
        COUNT(r.id) AS rating_count
      FROM beans b
      LEFT JOIN ratings r ON r.bean_id = b.id
      LEFT JOIN roasteries ro ON ro.id = b.roastery_id
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

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function getOrCreateDailyQuiz(dateKey = todayKey()) {
  await ensureInit();
  const existing = await db.execute({
    sql: `
      SELECT q.id, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_index, q.fact
      FROM daily_quiz d
      JOIN quiz_questions q ON q.id = d.question_id
      WHERE d.quiz_date = ?
      LIMIT 1
    `,
    args: [dateKey],
  });
  if (existing.rows[0]) {
    return { dateKey, question: existing.rows[0] };
  }

  const pick = await db.execute({
    sql: `
      SELECT id
      FROM quiz_questions
      WHERE id NOT IN (SELECT question_id FROM daily_quiz)
      ORDER BY RANDOM()
      LIMIT 1
    `,
  });
  const questionId = pick.rows[0]?.id;
  if (!questionId) {
    return { dateKey, question: null };
  }

  await db.execute({
    sql: `
      INSERT OR IGNORE INTO daily_quiz (quiz_date, question_id)
      VALUES (?, ?)
    `,
    args: [dateKey, questionId],
  });

  const question = await db.execute({
    sql: `
      SELECT id, question, option_a, option_b, option_c, option_d, correct_index, fact
      FROM quiz_questions
      WHERE id = ?
      LIMIT 1
    `,
    args: [questionId],
  });
  return { dateKey, question: question.rows[0] || null };
}

export async function getRandomQuizQuestion() {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT id, question, option_a, option_b, option_c, option_d, correct_index, fact
      FROM quiz_questions
      ORDER BY RANDOM()
      LIMIT 1
    `,
  });
  return result.rows[0] || null;
}

export async function getQuizQuestionById(id) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT id, question, option_a, option_b, option_c, option_d, correct_index, fact
      FROM quiz_questions
      WHERE id = ?
      LIMIT 1
    `,
    args: [id],
  });
  return result.rows[0] || null;
}

export async function getUserQuizAnswer(userId, dateKey = todayKey()) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT selected_index, correct
      FROM quiz_answers
      WHERE user_id = ? AND quiz_date = ?
      LIMIT 1
    `,
    args: [userId, dateKey],
  });
  return result.rows[0] || null;
}

export async function submitDailyQuizAnswer(userId, selectedIndex, dateKey = todayKey()) {
  await ensureInit();
  const existing = await getUserQuizAnswer(userId, dateKey);
  if (existing) {
    return { alreadyAnswered: true, ...existing };
  }

  const quiz = await getOrCreateDailyQuiz(dateKey);
  const question = quiz.question;
  if (!question) {
    return { error: "No quiz available" };
  }
  const correct = Number(selectedIndex) === Number(question.correct_index) ? 1 : 0;

  await db.execute({
    sql: `
      INSERT INTO quiz_answers (
        user_id,
        quiz_date,
        question_id,
        selected_index,
        correct
      ) VALUES (?, ?, ?, ?, ?)
    `,
    args: [userId, dateKey, question.id, selectedIndex, correct],
  });

  if (correct) {
    await db.execute({
      sql: `
        INSERT INTO user_beanometer (user_id, beans_count)
        VALUES (?, 1)
        ON CONFLICT(user_id)
        DO UPDATE SET beans_count = beans_count + 1, updated_at = datetime('now')
      `,
      args: [userId],
    });
  }

  return { correct: Boolean(correct), selectedIndex };
}

export async function getBeanometerStats(userId) {
  await ensureInit();
  const user = await db.execute({
    sql: "SELECT beans_count FROM user_beanometer WHERE user_id = ?",
    args: [userId],
  });
  const beansCount = user.rows[0]?.beans_count || 0;

  const leaderboard = await db.execute({
    sql: `
      SELECT ub.user_id,
             ub.beans_count,
             COALESCE(u.name, u.email, 'Anonymous') AS label
      FROM user_beanometer ub
      LEFT JOIN users u ON u.id = ub.user_id
      ORDER BY ub.beans_count DESC, label ASC
      LIMIT 10
    `,
  });

  const better = await db.execute({
    sql: `
      SELECT COUNT(*) AS better
      FROM user_beanometer
      WHERE beans_count > ?
    `,
    args: [beansCount],
  });
  const total = await db.execute({
    sql: "SELECT COUNT(*) AS count FROM user_beanometer",
  });
  const totalBeans = await db.execute({
    sql: "SELECT COALESCE(SUM(beans_count), 0) AS total FROM user_beanometer",
  });

  return {
    beansCount,
    rank: (better.rows[0]?.better || 0) + 1,
    totalUsers: total.rows[0]?.count || 0,
    leaderboard: leaderboard.rows || [],
    totalBeans: totalBeans.rows[0]?.total || 0,
  };
}

export async function getBeanSnakeLeaderboard(limit = 10) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT display_name, score, created_at
      FROM bean_snake_scores
      ORDER BY score DESC, created_at ASC
      LIMIT ?
    `,
    args: [limit],
  });
  return result.rows || [];
}

export async function submitBeanSnakeScore({ userId, displayName, score }) {
  await ensureInit();
  if (!displayName || !Number.isFinite(score)) return null;
  await db.execute({
    sql: `
      INSERT INTO bean_snake_scores (user_id, display_name, score)
      VALUES (?, ?, ?)
    `,
    args: [userId || null, displayName.trim(), score],
  });
  return true;
}

export async function getBeanPongLeaderboard(limit = 10) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT display_name, score, created_at
      FROM bean_pong_scores
      ORDER BY score DESC, created_at ASC
      LIMIT ?
    `,
    args: [limit],
  });
  return result.rows || [];
}

export async function submitBeanPongScore({ userId, displayName, score }) {
  await ensureInit();
  if (!displayName || !Number.isFinite(score)) return null;
  await db.execute({
    sql: `
      INSERT INTO bean_pong_scores (user_id, display_name, score)
      VALUES (?, ?, ?)
    `,
    args: [userId || null, displayName.trim(), score],
  });
  return true;
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
  let roasteries = { rows: [] };
  try {
    roasteries = await db.execute({
      sql: `
        SELECT id, name, city, region, country
        FROM roasteries
        ORDER BY name ASC
      `,
    });
  } catch (error) {
    const message = error?.message || "";
    if (!message.includes("no such table")) {
      throw error;
    }
  }

  return {
    beans: rows.rows,
    names: unique(rows.rows.map((row) => row.name)),
    roasters: unique(rows.rows.map((row) => row.roaster)),
    originCountries: unique(rows.rows.map((row) => row.origin_country)),
    originRegions: unique(rows.rows.map((row) => row.origin_region)),
    countryRegions: countryRegions.rows,
    roasteries: roasteries.rows || [],
  };
}

export async function isValidCountryRegion(country, region) {
  await ensureInit();
  const countryCheck = await db.execute({
    sql: `SELECT 1 FROM country_regions WHERE LOWER(country) = LOWER(?) LIMIT 1`,
    args: [country],
  });
  if (countryCheck.rows.length === 0) return false;
  if (!region) return true;
  const regionCheck = await db.execute({
    sql: `
      SELECT 1
      FROM country_regions
      WHERE LOWER(country) = LOWER(?) AND LOWER(region) = LOWER(?)
      LIMIT 1
    `,
    args: [country, region],
  });
  return regionCheck.rows.length > 0;
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
        AND IFNULL(roastery_id, 0) = IFNULL(?, 0)
      LIMIT 1
    `,
    args: [
      data.name.trim(),
      (data.roaster || "").trim(),
      data.originCountry.trim(),
      (data.originRegion || "").trim(),
      data.roasteryId || null,
    ],
  });
  return result.rows[0] || null;
}

export async function getUserByEmail(email) {
  await ensureInit();
  const result = await db.execute({
    sql: `
      SELECT id, email, name, image, password_hash
      FROM users
      WHERE LOWER(email) = LOWER(?)
      LIMIT 1
    `,
    args: [email],
  });
  return result.rows[0] || null;
}

export async function createCredentialsUser({ email, name, passwordHash }) {
  await ensureInit();
  const id = crypto.randomUUID();
  await db.execute({
    sql: `
      INSERT INTO users (id, email, name, password_hash)
      VALUES (?, ?, ?, ?)
    `,
    args: [id, email, name || null, passwordHash],
  });
  return { id, email, name: name || null };
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
