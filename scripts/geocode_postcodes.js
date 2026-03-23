import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";

const CSV_PATH = process.argv[2] || path.join("scripts", "roaster_postcodes.csv");
const DATABASE_URL = process.env.DATABASE_URL || "file:./data/rate-my-bean.db";
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;
const FORCE_ALL = process.argv.includes("--all");
const MAX_ROWS = Number(process.env.GEOCODE_LIMIT || 0);

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const [name, postcode] = lines[i].split(",").map((cell) => cell?.trim());
    if (!name || !postcode) continue;
    rows.push({ name, postcode });
  }
  return rows;
}

async function geocodePostcodes(postcodes) {
  const response = await fetch("https://api.postcodes.io/postcodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postcodes }),
  });
  if (!response.ok) {
    throw new Error(`postcodes.io failed: ${response.status}`);
  }
  const data = await response.json();
  return data.result || [];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildNominatimQuery(row) {
  const parts = [
    row.name,
    row.address,
    row.city,
    row.region,
    row.country || "United Kingdom",
  ]
    .map((part) => (part || "").trim())
    .filter(Boolean);
  return parts.join(", ");
}

async function geocodeNominatim(row) {
  const query = buildNominatimQuery(row);
  if (!query) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "RateMyBean/1.0 (geocode script)",
      "Accept-Language": "en",
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data?.[0];
  if (!hit) return null;
  const latitude = Number(hit.lat);
  const longitude = Number(hit.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

async function main() {
  let db = createClient({
    url: DATABASE_URL,
    authToken: DATABASE_AUTH_TOKEN,
  });

  const hasRoasteriesTable = async (client) => {
    try {
      const result = await client.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='roasteries'"
      );
      return (result.rows || []).length > 0;
    } catch {
      return false;
    }
  };

  if (!(await hasRoasteriesTable(db)) && DATABASE_URL === "file:./data/rate-my-bean.db") {
    if (fs.existsSync(path.resolve("dev.db"))) {
      console.warn("roasteries table not found in data DB, switching to dev.db");
      db = createClient({
        url: "file:./dev.db",
        authToken: DATABASE_AUTH_TOKEN,
      });
    }
  }

  if (!(await hasRoasteriesTable(db))) {
    console.error("roasteries table not found. Set DATABASE_URL to your DB file.");
    process.exit(1);
  }

  let rows = [];
  if (fs.existsSync(CSV_PATH)) {
    const csv = fs.readFileSync(CSV_PATH, "utf8");
    rows = parseCsv(csv);
  }

  let addressRows = [];
  if (!rows.length) {
    const result = await db.execute({
      sql: "SELECT name, address, city, region, country FROM roasteries",
    });
    addressRows = (result.rows || []).map((row) => ({
      name: row.name,
      address: row.address || "",
      city: row.city || "",
      region: row.region || "",
      country: row.country || "",
    }));
  }

  if (!rows.length && !addressRows.length) {
    console.error("No rows found in CSV or DB.");
    process.exit(1);
  }

  const batchSize = 100;
  let updated = 0;
  let postcodesFailed = false;
  if (rows.length) {
    try {
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const postcodes = batch.map((row) => row.postcode);
        const results = await geocodePostcodes(postcodes);
        for (let j = 0; j < batch.length; j += 1) {
          const { name, postcode } = batch[j];
          const result = results[j];
          if (!result || result.result === null) {
            console.warn(`No geocode result for ${name} (${postcode})`);
            continue;
          }
          const latitude = result.result.latitude;
          const longitude = result.result.longitude;
          await db.execute({
            sql: `
              UPDATE roasteries
              SET latitude = ?, longitude = ?
              WHERE LOWER(name) = LOWER(?)
            `,
            args: [latitude, longitude, name],
          });
          updated += 1;
        }
      }
    } catch (error) {
      postcodesFailed = true;
      console.warn(`postcodes.io failed, falling back to Nominatim: ${error.message}`);
    }
  } else {
    postcodesFailed = true;
  }

  if (postcodesFailed && addressRows.length) {
    for (const row of addressRows) {
      const result = await geocodeNominatim(row);
      if (!result) {
        console.warn(`No Nominatim result for ${row.name}`);
      } else {
        await db.execute({
          sql: `
            UPDATE roasteries
            SET latitude = ?, longitude = ?
            WHERE LOWER(name) = LOWER(?)
          `,
          args: [result.latitude, result.longitude, row.name],
        });
        updated += 1;
      }
      await sleep(1100);
    }
  }

  const fallbackQuery = FORCE_ALL
    ? `
        SELECT name, address, city, region, country
        FROM roasteries
        ORDER BY name ASC
      `
    : `
        SELECT name, address, city, region, country
        FROM roasteries
        WHERE latitude IS NULL OR longitude IS NULL
        ORDER BY name ASC
      `;

  const missing = await db.execute({ sql: fallbackQuery });
  let missingRows = (missing.rows || []).map((row) => ({
    name: row.name,
    address: row.address || "",
    city: row.city || "",
    region: row.region || "",
    country: row.country || "",
  }));
  if (MAX_ROWS > 0) {
    missingRows = missingRows.slice(0, MAX_ROWS);
  }

  if (missingRows.length) {
    console.log(
      `Geocoding ${missingRows.length} ${FORCE_ALL ? "entries" : "missing entries"} with Nominatim...`
    );
  }

  for (const row of missingRows) {
    const result = await geocodeNominatim(row);
    if (!result) {
      console.warn(`No Nominatim result for ${row.name}`);
    } else {
      await db.execute({
        sql: `
          UPDATE roasteries
          SET latitude = ?, longitude = ?
          WHERE LOWER(name) = LOWER(?)
        `,
        args: [result.latitude, result.longitude, row.name],
      });
      updated += 1;
    }
    await sleep(1100);
  }

  console.log(`Updated ${updated} roasteries`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
