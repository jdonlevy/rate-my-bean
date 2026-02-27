import { addRating } from "@/lib/db";

export async function POST(request, { params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid bean id" }, { status: 400 });
  }

  const body = await request.json();
  const score = Number(body?.score);

  if (!Number.isFinite(score) || score < 1 || score > 5) {
    return Response.json({ error: "score must be 1-5" }, { status: 400 });
  }

  const ratingId = addRating(id, {
    score,
    notes: body?.notes?.trim() || "",
    pricePaid: body?.pricePaid === "" ? null : Number(body?.pricePaid),
  });

  return Response.json({ id: ratingId });
}
