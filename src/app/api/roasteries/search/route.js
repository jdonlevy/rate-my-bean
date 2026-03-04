import { getRoasteriesByBounds, upsertRoasteries } from "@/lib/db";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function parseNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const south = parseNumber(searchParams.get("south"));
  const west = parseNumber(searchParams.get("west"));
  const north = parseNumber(searchParams.get("north"));
  const east = parseNumber(searchParams.get("east"));

  if ([south, west, north, east].some((v) => v == null)) {
    return Response.json({ error: "Missing bounds" }, { status: 400 });
  }

  const query = `
    [out:json][timeout:25];
    (
      node["craft"="coffee_roaster"](${south},${west},${north},${east});
      way["craft"="coffee_roaster"](${south},${west},${north},${east});
    );
    out center tags;
  `;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "RateMyBean/1.0",
      },
      body: `data=${encodeURIComponent(query)}`,
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json(
        { error: "Failed to load roasteries." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const roasteries = (data.elements || [])
      .map(buildRoastery)
      .filter(Boolean);

    await upsertRoasteries(roasteries);
    const stored = await getRoasteriesByBounds({ south, west, north, east });
    return Response.json({ roasteries: stored });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
