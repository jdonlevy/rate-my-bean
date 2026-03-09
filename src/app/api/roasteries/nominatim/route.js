function parseNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
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

  const viewbox = `${west},${north},${east},${south}`;
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

  if (!res.ok) {
    return Response.json({ error: "Nominatim failed" }, { status: 502 });
  }

  const data = await res.json();
  return Response.json({ results: data || [] }, { status: 200 });
}
