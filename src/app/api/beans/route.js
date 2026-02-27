import { createBean, getBeans } from "@/lib/db";

export async function GET() {
  const beans = getBeans();
  return Response.json({ beans });
}

export async function POST(request) {
  const body = await request.json();

  if (!body?.name || !body?.originCountry) {
    return Response.json(
      { error: "name and originCountry are required" },
      { status: 400 }
    );
  }

  const id = createBean({
    name: body.name.trim(),
    roaster: body.roaster?.trim() || "",
    originCountry: body.originCountry.trim(),
    originRegion: body.originRegion?.trim() || "",
    blend: Boolean(body.blend),
    process: body.process?.trim() || "",
    roastLevel: body.roastLevel?.trim() || "",
    priceUsd: body.priceUsd === "" ? null : Number(body.priceUsd),
    flavorNotes: body.flavorNotes?.trim() || "",
  });

  return Response.json({ id });
}
