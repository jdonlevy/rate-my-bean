import { createRoastery } from "@/lib/db";

function parseNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function POST(request) {
  const body = await request.json();
  const name = body?.name?.toString().trim() || "";
  const website = body?.website?.toString().trim() || "";
  const address = body?.address?.toString().trim() || "";
  const city = body?.city?.toString().trim() || "";
  const region = body?.region?.toString().trim() || "";
  const country = body?.country?.toString().trim() || "";
  const latitude = parseNumber(body?.latitude);
  const longitude = parseNumber(body?.longitude);

  if (!name || latitude == null || longitude == null) {
    return Response.json(
      { error: "Name, latitude, and longitude are required." },
      { status: 400 }
    );
  }

  const externalId = `manual:${crypto.randomUUID()}`;
  const roastery = await createRoastery({
    name,
    website,
    address,
    city,
    region,
    country,
    latitude,
    longitude,
    source: "manual",
    externalId,
  });

  return Response.json({ roastery }, { status: 201 });
}
