import { upsertRoasteries } from "@/lib/db";

function parseNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function POST(request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not available" }, { status: 403 });
  }

  const body = await request.json();
  const items = Array.isArray(body?.roasteries) ? body.roasteries : [];
  if (!items.length) {
    return Response.json({ error: "No roasteries provided" }, { status: 400 });
  }

  const normalized = items
    .map((item) => {
      const latitude = parseNumber(item.latitude);
      const longitude = parseNumber(item.longitude);
      if (!item.name || latitude == null || longitude == null || !item.externalId) {
        return null;
      }
      return {
        name: item.name,
        website: item.website || "",
        address: item.address || "",
        city: item.city || "",
        region: item.region || "",
        country: item.country || "",
        latitude,
        longitude,
        source: item.source || "osm",
        externalId: item.externalId,
      };
    })
    .filter(Boolean);

  if (!normalized.length) {
    return Response.json({ error: "No valid roasteries provided" }, { status: 400 });
  }

  await upsertRoasteries(normalized);
  return Response.json({ count: normalized.length }, { status: 200 });
}
