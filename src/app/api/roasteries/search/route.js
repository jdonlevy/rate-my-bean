import { getFoursquareRoasteriesByBounds, getRoasteriesByBounds, upsertFoursquareRoasteries } from "@/lib/db";

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
    id: `fsq-${place.fsq_id}`,
    externalId: place.fsq_id,
    name: place.name,
    website: place.website || null,
    address: loc.address || null,
    city: loc.city || null,
    region: loc.region || null,
    country: loc.country || null,
    latitude: geo.latitude,
    longitude: geo.longitude,
    source: "fsq",
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
    // Derive a radius from the bounds for the FSQ call
    radius = Math.min(
      Math.abs(north - south) * 111000,
      Math.abs(east - west) * 111000
    ) / 2;
  } else {
    return Response.json({ error: "Missing bounds" }, { status: 400 });
  }

  // Run local DB and FSQ cache lookup in parallel
  const [localRoasteries, cachedFsq] = await Promise.all([
    getRoasteriesByBounds(bounds),
    getFoursquareRoasteriesByBounds(bounds),
  ]);

  // If FSQ cache is empty for this area, call the live API and cache the results
  let fsqRoasteries = cachedFsq;
  if (!cachedFsq.length && centerLat != null && centerLon != null) {
    const fresh = await queryFoursquare(centerLat, centerLon, radius);
    if (fresh.length) {
      await upsertFoursquareRoasteries(fresh).catch(() => {});
      fsqRoasteries = fresh;
    }
  }

  // Deduplicate FSQ results against local DB entries by coordinate (~100m)
  const localCoordSet = new Set(
    localRoasteries.map(
      (r) => `${Number(r.latitude).toFixed(3)},${Number(r.longitude).toFixed(3)}`
    )
  );
  const uniqueFsq = fsqRoasteries.filter((r) => {
    const key = `${Number(r.latitude).toFixed(3)},${Number(r.longitude).toFixed(3)}`;
    return !localCoordSet.has(key);
  });

  return Response.json({
    roasteries: [...localRoasteries, ...uniqueFsq],
  });
}
