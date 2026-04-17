#!/usr/bin/env node
/**
 * Tiles the UK into small bounding boxes, queries OpenStreetMap Overpass
 * for coffee roasters and coffee shops in each tile, and upserts them
 * into the database.
 *
 * Reads DATABASE_URL and DATABASE_AUTH_TOKEN from the environment.
 * Target different environments by setting those vars before running:
 *
 *   # Local dev (default):
 *   node scripts/seed-osm-uk.js
 *
 *   # Production:
 *   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... node scripts/seed-osm-uk.js
 *
 * Options:
 *   --dry-run   Fetch and log counts but do not write to DB
 *   --resume N  Skip the first N tiles (to resume an interrupted run)
 */

import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Allow the env var already present in .env.local to disable TLS verification
// (needed on some machines due to certificate issues with Overpass mirrors)
if (process.env.OVERPASS_INSECURE_TLS === "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DRY_RUN = process.argv.includes("--dry-run");
const RESUME_FROM = (() => {
  const idx = process.argv.indexOf("--resume");
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) || 0 : 0;
})();

// UK bounding box
const UK_SOUTH = 49.8;
const UK_NORTH = 60.9;
const UK_WEST = -8.2;
const UK_EAST = 2.0;

// Tile size — small enough to stay within Overpass limits
const TILE_LAT = 0.3;
const TILE_LON = 0.4;

// Delay between Overpass requests (ms) to avoid rate limiting
const REQUEST_DELAY_MS = 1500;

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

// ── DB setup ──────────────────────────────────────────────────────────────────

const databaseUrl = process.env.DATABASE_URL || "file:./data/rate-my-bean.db";
if (databaseUrl.startsWith("file:")) {
  const filePath = databaseUrl.replace("file:", "");
  const dirPath = path.isAbsolute(filePath)
    ? path.dirname(filePath)
    : path.join(process.cwd(), path.dirname(filePath));
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

const db = createClient({
  url: databaseUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

// ── Overpass ──────────────────────────────────────────────────────────────────

async function queryOverpass(south, west, north, east) {
  const query = [
    `[out:json][timeout:30];`,
    `(`,
    `  node["craft"="coffee_roaster"](${south},${west},${north},${east});`,
    `  way["craft"="coffee_roaster"](${south},${west},${north},${east});`,
    `  node["shop"="coffee"](${south},${west},${north},${east});`,
    `  way["shop"="coffee"](${south},${west},${north},${east});`,
    `);`,
    `out center tags;`,
  ].join("");

  const body = `data=${encodeURIComponent(query)}`;
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };

  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        body,
        headers,
        signal: AbortSignal.timeout(35000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.trim().startsWith("<")) continue; // HTML error
      const data = JSON.parse(text);
      return data.elements || [];
    } catch {
      // try next endpoint
    }
  }
  return null; // all endpoints failed
}

function osmToRoastery(el) {
  const lat = el.type === "node" ? el.lat : el.center?.lat;
  const lon = el.type === "node" ? el.lon : el.center?.lon;
  if (!lat || !lon) return null;
  const tags = el.tags || {};
  return {
    name: tags.name || "Coffee Roastery",
    website: tags.website || tags.url || null,
    address:
      [tags["addr:housenumber"], tags["addr:street"]]
        .filter(Boolean)
        .join(" ") || null,
    city: tags["addr:city"] || tags["addr:town"] || null,
    region: tags["addr:state"] || tags["addr:county"] || null,
    country: tags["addr:country"] || "United Kingdom",
    latitude: lat,
    longitude: lon,
    source: "osm",
    externalId: `${el.type}-${el.id}`,
  };
}

// ── DB upsert ─────────────────────────────────────────────────────────────────

async function upsertBatch(roasteries) {
  if (!roasteries.length) return;
  const batch = roasteries.map((r) => ({
    sql: `
      INSERT INTO roasteries (name, website, address, city, region, country,
        latitude, longitude, source, external_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source, external_id) DO UPDATE SET
        name    = excluded.name,
        website = COALESCE(excluded.website, roasteries.website),
        address = COALESCE(excluded.address, roasteries.address),
        city    = COALESCE(excluded.city,    roasteries.city),
        region  = COALESCE(excluded.region,  roasteries.region),
        country = COALESCE(excluded.country, roasteries.country),
        latitude  = excluded.latitude,
        longitude = excluded.longitude
    `,
    args: [
      r.name,
      r.website,
      r.address,
      r.city,
      r.region,
      r.country,
      r.latitude,
      r.longitude,
      r.source,
      r.externalId,
    ],
  }));
  await db.batch(batch);
}

// ── Tile generation ───────────────────────────────────────────────────────────

function generateTiles() {
  const tiles = [];
  for (let lat = UK_SOUTH; lat < UK_NORTH; lat = +(lat + TILE_LAT).toFixed(4)) {
    for (let lon = UK_WEST; lon < UK_EAST; lon = +(lon + TILE_LON).toFixed(4)) {
      tiles.push({
        south: +lat.toFixed(4),
        west: +lon.toFixed(4),
        north: +(lat + TILE_LAT).toFixed(4),
        east: +(lon + TILE_LON).toFixed(4),
      });
    }
  }
  return tiles;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const tiles = generateTiles();
  console.log(`UK seed — ${tiles.length} tiles, tile size ${TILE_LAT}°x${TILE_LON}°`);
  console.log(`Database: ${databaseUrl}`);
  if (DRY_RUN) console.log("DRY RUN — no writes");
  if (RESUME_FROM > 0) console.log(`Resuming from tile ${RESUME_FROM}`);
  console.log("");

  let totalInserted = 0;
  let totalFailed = 0;

  for (let i = RESUME_FROM; i < tiles.length; i++) {
    const tile = tiles[i];
    const label = `[${i + 1}/${tiles.length}] (${tile.south},${tile.west})→(${tile.north},${tile.east})`;

    const elements = await queryOverpass(tile.south, tile.west, tile.north, tile.east);

    if (elements === null) {
      console.log(`${label}  ✗ all endpoints failed, skipping`);
      totalFailed++;
    } else {
      const roasteries = elements.map(osmToRoastery).filter(Boolean);
      if (!DRY_RUN && roasteries.length > 0) {
        await upsertBatch(roasteries);
      }
      totalInserted += roasteries.length;
      if (roasteries.length > 0) {
        console.log(`${label}  → ${roasteries.length} results`);
      } else {
        process.stdout.write(".");
      }
    }

    // Rate limit delay between requests
    if (i < tiles.length - 1) {
      await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
    }
  }

  console.log(`\n\nDone. ${totalInserted} roasteries upserted, ${totalFailed} tiles failed.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
