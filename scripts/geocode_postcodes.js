import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";

const CSV_PATH = process.argv[2] || path.join("scripts", "roaster_postcodes.csv");
const DATABASE_URL = process.env.DATABASE_URL || "file:./data/rate-my-bean.db";
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

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

  if (!rows.length) {
    const result = await db.execute({
      sql: "SELECT name, address FROM roasteries",
    });
    const postcodeRegex = /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}\b/i;
    rows = (result.rows || [])
      .map((row) => {
        const address = row.address || "";
        const match = address.match(postcodeRegex);
        if (!match) return null;
        return { name: row.name, postcode: match[0].toUpperCase() };
      })
      .filter(Boolean);
  }

  if (!rows.length) {
    console.error("No rows found in CSV or DB addresses.");
    process.exit(1);
  }

  const batchSize = 100;
  let updated = 0;
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

  console.log(`Updated ${updated} roasteries`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
