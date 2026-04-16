import { getTopBeansByLocation } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat"));
  const lng = parseFloat(searchParams.get("lng"));
  const radius = parseFloat(searchParams.get("radius")) || 10;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const beans = await getTopBeansByLocation(lat, lng, radius, 6);
  return Response.json({ beans });
}
