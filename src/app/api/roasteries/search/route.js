import { getRoasteriesByBounds, upsertRoasteries } from "@/lib/db";
import https from "node:https";

const OVERPASS_URLS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter",
];
const insecureAgent = new https.Agent({ rejectUnauthorized: false });

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

function normalizeAddress(tags) {
  if (!tags) return {};
  return {
    address: tags["addr:street"]
      ? `${tags["addr:street"]} ${tags["addr:housenumber"] || ""}`.trim()
      : tags["addr:full"] || "",
    city: tags["addr:city"] || "",
    region: tags["addr:state"] || "",
    country: tags["addr:country"] || "",
  };
}

function buildRoastery(element) {
  const tags = element.tags || {};
  const coords = element.center || element;
  const latitude = parseNumber(coords.lat);
  const longitude = parseNumber(coords.lon);
  if (!latitude || !longitude) return null;

  const { address, city, region, country } = normalizeAddress(tags);

  return {
    name: tags.name || "Unknown roastery",
    website: tags.website || tags["contact:website"] || "",
    address,
    city,
    region,
    country,
    latitude,
    longitude,
    source: "osm",
    externalId: `${element.type}/${element.id}`,
  };
}

function buildNominatimRoastery(item) {
  const latitude = parseNumber(item.lat);
  const longitude = parseNumber(item.lon);
  if (latitude == null || longitude == null) return null;
  const address = item.address || {};
  return {
    name: item.name || item.display_name?.split(",")?.[0] || "Unknown roastery",
    website: item.extratags?.website || "",
    address: item.display_name || "",
    city: address.city || address.town || address.village || "",
    region: address.state || address.county || "",
    country: address.country || "",
    latitude,
    longitude,
    source: "nominatim",
    externalId: `${item.osm_type}/${item.osm_id}`,
  };
}

async function fetchNominatim(bounds) {
  const viewbox = `${bounds.west},${bounds.north},${bounds.east},${bounds.south}`;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&bounded=1&limit=50&viewbox=${encodeURIComponent(
    viewbox
  )}&q=${encodeURIComponent("coffee")}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "RateMyBean/1.0",
      "Accept-Language": "en",
    },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data || []).map(buildNominatimRoastery).filter(Boolean);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get("debug") === "1";
  const south = parseNumber(searchParams.get("south"));
  const west = parseNumber(searchParams.get("west"));
  const north = parseNumber(searchParams.get("north"));
  const east = parseNumber(searchParams.get("east"));
  const lat = parseNumber(searchParams.get("lat"));
  const lon = parseNumber(searchParams.get("lon"));
  const radius = parseNumber(searchParams.get("radius")) || 10000;

  let bounds = { south, west, north, east };

  if (lat != null && lon != null) {
    bounds = boundsFromRadius(lat, lon, radius);
  }

  if ([bounds.south, bounds.west, bounds.north, bounds.east].some((v) => v == null)) {
    return Response.json({ error: "Missing bounds" }, { status: 400 });
  }

  const cached = await getRoasteriesByBounds(bounds);
  if (cached.length) {
    return Response.json({ roasteries: cached, stale: true }, { status: 200 });
  }

  const query =
    lat != null && lon != null
      ? `
        [out:json][timeout:60];
        (
          nwr["craft"="coffee_roaster"](around:${radius},${lat},${lon});
          nwr["shop"="coffee"](around:${radius},${lat},${lon});
          nwr["shop"="coffee"]["roaster"="yes"](around:${radius},${lat},${lon});
          nwr["amenity"="cafe"]["roaster"="yes"](around:${radius},${lat},${lon});
          nwr["amenity"="cafe"](around:${radius},${lat},${lon});
          nwr["industrial"="coffee"](around:${radius},${lat},${lon});
          nwr["man_made"="works"]["product"~"coffee",i](around:${radius},${lat},${lon});
          nwr["name"~"roast|roastery|roaster|coffee|cafe",i](around:${radius},${lat},${lon});
        );
        out center tags;
      `
      : `
        [out:json][timeout:60];
        (
          nwr["craft"="coffee_roaster"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
          nwr["shop"="coffee"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
          nwr["shop"="coffee"]["roaster"="yes"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
          nwr["amenity"="cafe"]["roaster"="yes"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
          nwr["amenity"="cafe"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
          nwr["industrial"="coffee"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
          nwr["man_made"="works"]["product"~"coffee",i](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
          nwr["name"~"roast|roastery|roaster|coffee|cafe",i](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        );
        out center tags;
      `;

  let lastError = "";
  for (const url of OVERPASS_URLS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "RateMyBean/1.0",
        },
        body: `data=${encodeURIComponent(query)}`,
        cache: "no-store",
        signal: controller.signal,
        agent: process.env.OVERPASS_INSECURE_TLS === "1" ? insecureAgent : undefined,
      });
      clearTimeout(timer);

      if (!res.ok) {
        lastError = `Overpass ${url} returned ${res.status}`;
        continue;
      }

      const data = await res.json();
      const roasteries = (data.elements || [])
        .map(buildRoastery)
        .filter(Boolean);

      await upsertRoasteries(roasteries);
      const stored = await getRoasteriesByBounds(bounds);
      return Response.json(
        { roasteries: stored, stale: false, source: url },
        { status: 200 }
      );
    } catch (error) {
      lastError = error?.message || "Overpass request failed";
    }
  }

  try {
    const nominatim = await fetchNominatim(bounds);
    if (nominatim.length) {
      await upsertRoasteries(nominatim);
      const stored = await getRoasteriesByBounds(bounds);
      return Response.json(
        { roasteries: stored, stale: false, source: "nominatim" },
        { status: 200 }
      );
    }
  } catch (error) {
    lastError = error?.message || lastError;
  }

  return Response.json(
    {
      roasteries: cached,
      stale: true,
      error: debug ? lastError : undefined,
    },
    { status: 200 }
  );
}
