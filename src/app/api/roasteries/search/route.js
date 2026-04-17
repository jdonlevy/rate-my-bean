import { getRoasteriesByBounds, upsertRoasteries } from "@/lib/db";

const FSQ_API_KEY = process.env.FOURSQUARE_API_KEY;

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

function fsqToRoastery(place) {
  const loc = place.location || {};
  const geo = place.geocodes?.main;
  if (!geo?.latitude || !geo?.longitude) return null;
  return {
    name: place.name,
    website: place.website || null,
    address: loc.address || null,
    city: loc.city || null,
    region: loc.region || null,
    country: loc.country || null,
    latitude: geo.latitude,
    longitude: geo.longitude,
    source: "fsq",
    externalId: place.fsq_id,
  };
}

async function queryFoursquare(lat, lon, radiusMeters) {
  if (!FSQ_API_KEY) return [];
  const url = new URL("https://api.foursquare.com/v3/places/search");
  url.searchParams.set("ll", `${lat},${lon}`);
  url.searchParams.set("radius", Math.min(Math.round(radiusMeters), 50000));
  url.searchParams.set("query", "coffee roaster");
  url.searchParams.set("limit", "50");
  url.searchParams.set("fields", "fsq_id,name,location,geocodes,website");

  try {
    const res = await fetch(url, {
      headers: { Authorization: FSQ_API_KEY, Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map(fsqToRoastery).filter(Boolean);
  } catch {
    return [];
  }
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
  let centerLat;
  let centerLon;

  if (lat != null && lon != null) {
    centerLat = lat;
    centerLon = lon;
    bounds = boundsFromRadius(lat, lon, radius);
  } else if ([south, west, north, east].every((v) => v != null)) {
    bounds = { south, west, north, east };
    centerLat = (south + north) / 2;
    centerLon = (west + east) / 2;
    radius = Math.min(
      Math.abs(north - south) * 111000,
      Math.abs(east - west) * 111000
    ) / 2;
  } else {
    return Response.json({ error: "Missing bounds" }, { status: 400 });
  }

  // Check what's already in the DB for this area
  const existing = await getRoasteriesByBounds(bounds);
  const hasFsq = existing.some((r) => r.source === "fsq");

  // If no FSQ results cached yet, fetch from Foursquare and store
  if (!hasFsq && centerLat != null && centerLon != null) {
    const fresh = await queryFoursquare(centerLat, centerLon, radius);
    if (fresh.length) {
      await upsertRoasteries(fresh).catch(() => {});
      return Response.json({ roasteries: [...existing, ...fresh] });
    }
  }

  return Response.json({ roasteries: existing });
}
