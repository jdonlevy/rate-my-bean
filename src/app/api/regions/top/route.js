import { getTopRegions } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || "5");
  const topRegions = getTopRegions(Number.isFinite(limit) ? limit : 5);

  return Response.json({ topRegions });
}
