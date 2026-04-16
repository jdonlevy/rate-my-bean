import { getRoasteriesByBounds } from "@/lib/db";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

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

async function queryOverpass({ south, west, north, east }) {
  const query = `[out:json][timeout:15];(node["craft"="coffee_roaster"](${south},${west},${north},${east});way["craft"="coffee_roaster"](${south},${west},${north},${east}););out center tags;`;
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.elements || []).map(osmToRoastery).filter(Boolean);
}

function osmToRoastery(el) {
  const lat = el.type === "node" ? el.lat : el.center?.lat;
  const lon = el.type === "node" ? el.lon : el.center?.lon;
  if (!lat || !lon) return null;
  const tags = el.tags || {};
  return {
    id: `osm-${el.type}-${el.id}`,
    name: tags.name || "Coffee Roastery",
    website: tags.website || tags.url || null,
    address:
      [tags["addr:housenumber"], tags["addr:street"]]
        .filter(Boolean)
        .join(" ") || null,
    city: tags["addr:city"] || tags["addr:town"] || null,
    region: tags["addr:state"] || tags["addr:county"] || null,
    country: tags["addr:country"] || null,
    latitude: lat,
    longitude: lon,
    source: "osm",
  };
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

  let bounds = { south, west, north, east };

  if (lat != null && lon != null) {
    bounds = boundsFromRadius(lat, lon, radius);
  }

  if (
    [bounds.south, bounds.west, bounds.north, bounds.east].some(
      (v) => v == null
    )
  ) {
    return Response.json({ error: "Missing bounds" }, { status: 400 });
  }

  // Clamp to a reasonable search area to avoid huge Overpass queries
  const latSpan = Math.abs(bounds.north - bounds.south);
  const lonSpan = Math.abs(bounds.east - bounds.west);
  if (lat == null || lon == null) {
    if (latSpan > 0.35 || lonSpan > 0.5) {
      const centerLat = (bounds.north + bounds.south) / 2;
      const centerLon = (bounds.east + bounds.west) / 2;
      bounds = boundsFromRadius(centerLat, centerLon, Math.min(radius, 8000));
    }
  }

  // Run OSM and local DB in parallel
  const [osmRoasteries, localRoasteries] = await Promise.all([
    queryOverpass(bounds).catch(() => []),
    getRoasteriesByBounds(bounds),
  ]);

  // Merge: deduplicate OSM results that are within ~100m of a local entry
  const localCoords = new Set(
    localRoasteries.map(
      (r) => `${Number(r.latitude).toFixed(3)},${Number(r.longitude).toFixed(3)}`
    )
  );
  const uniqueOsm = osmRoasteries.filter((r) => {
    const key = `${Number(r.latitude).toFixed(3)},${Number(r.longitude).toFixed(3)}`;
    return !localCoords.has(key);
  });

  return Response.json({
    roasteries: [...localRoasteries, ...uniqueOsm],
    source: "osm",
  });
}
