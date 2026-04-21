import { getRoasteriesByBounds, upsertRoasteries } from "@/lib/db";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
];

function parseNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function boundsFromRadius(lat, lon, radiusMeters) {
  const latDelta = radiusMeters / 111000;
  const lonDelta = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));
  return {
    south: lat - latDelta,
    north: lat + latDelta,
    west: lon - lonDelta,
    east: lon + lonDelta,
  };
}

function osmToRoastery(el) {
  const lat = el.type === "node" ? el.lat : el.center?.lat;
  const lon = el.type === "node" ? el.lon : el.center?.lon;
  if (!lat || !lon) return null;
  const tags = el.tags || {};
  return {
    name: tags.name || "Coffee Roastery",
    website: tags.website || tags.url || null,
    address: [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ") || null,
    city: tags["addr:city"] || tags["addr:town"] || null,
    region: tags["addr:state"] || tags["addr:county"] || null,
    country: tags["addr:country"] || null,
    latitude: lat,
    longitude: lon,
    source: "osm",
    externalId: `${el.type}-${el.id}`,
  };
}

async function queryOverpass({ south, west, north, east }) {
  const query = [
    `[out:json][timeout:25];`,
    `(`,
    `  node["craft"="coffee_roaster"](${south},${west},${north},${east});`,
    `  way["craft"="coffee_roaster"](${south},${west},${north},${east});`,
    `  node["shop"="coffee"](${south},${west},${north},${east});`,
    `  way["shop"="coffee"](${south},${west},${north},${east});`,
    `);`,
    `out center tags;`,
  ].join("");

  const body = `data=${encodeURIComponent(query)}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "*/*",
    "User-Agent": "RateMyBean/1.0 (https://rate-my-bean.vercel.app)",
  };

  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        body,
        headers,
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.trim().startsWith("<")) continue;
      const data = JSON.parse(text);
      return (data.elements || []).map(osmToRoastery).filter(Boolean);
    } catch {
      // try next endpoint
    }
  }
  return null; // all endpoints failed
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const south = parseNumber(searchParams.get("south"));
  const west = parseNumber(searchParams.get("west"));
  const north = parseNumber(searchParams.get("north"));
  const east = parseNumber(searchParams.get("east"));
  const lat = parseNumber(searchParams.get("lat"));
  const lon = parseNumber(searchParams.get("lon"));
  let radius = parseNumber(searchParams.get("radius")) || 10000;

  let bounds;

  if (lat != null && lon != null) {
    bounds = boundsFromRadius(lat, lon, radius);
  } else if ([south, west, north, east].every((v) => v != null)) {
    bounds = { south, west, north, east };
  } else {
    return Response.json({ error: "Missing bounds" }, { status: 400 });
  }

  // Clamp bounds to avoid huge Overpass queries
  const latSpan = Math.abs(bounds.north - bounds.south);
  const lonSpan = Math.abs(bounds.east - bounds.west);
  if (latSpan > 0.35 || lonSpan > 0.5) {
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLon = (bounds.east + bounds.west) / 2;
    bounds = boundsFromRadius(centerLat, centerLon, Math.min(radius, 8000));
  }

  // Check DB cache first
  const existing = await getRoasteriesByBounds(bounds);
  const hasCached = existing.some((r) => r.source === "osm");

  if (hasCached) {
    return Response.json({ roasteries: existing });
  }

  // Nothing cached — hit Overpass and store results
  const fresh = await queryOverpass(bounds);
  if (fresh === null) {
    // All endpoints failed — return whatever we have in the DB
    return Response.json({ roasteries: existing });
  }

  if (fresh.length) {
    await upsertRoasteries(fresh).catch(() => {});
  }

  const userEntries = existing.filter((r) => r.source !== "osm");
  return Response.json({ roasteries: [...userEntries, ...fresh] });
}
