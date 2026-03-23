import { getRoasteriesByBounds } from "@/lib/db";

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

  if ([bounds.south, bounds.west, bounds.north, bounds.east].some((v) => v == null)) {
    return Response.json({ error: "Missing bounds" }, { status: 400 });
  }

  const latSpan = Math.abs(bounds.north - bounds.south);
  const lonSpan = Math.abs(bounds.east - bounds.west);
  if (lat == null || lon == null) {
    if (latSpan > 0.35 || lonSpan > 0.5) {
      const centerLat = (bounds.north + bounds.south) / 2;
      const centerLon = (bounds.east + bounds.west) / 2;
      radius = Math.min(radius, 8000);
      bounds = boundsFromRadius(centerLat, centerLon, radius);
    }
  }

  const cached = await getRoasteriesByBounds(bounds);
  return Response.json({ roasteries: cached, stale: false, source: "seed" }, { status: 200 });

  // Unreachable
}
