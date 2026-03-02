import { auth } from "@/auth";
import { addRating } from "@/lib/db";

export async function POST(request, { params }) {
  const { id: rawId } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json(
      { error: "Sign in required to add a rating." },
      { status: 401 }
    );
  }

  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid bean id" }, { status: 400 });
  }

  const body = await request.json();
  const score = Number(body?.score);
  const notes = body?.notes?.trim() || "";
  const pricePaid = body?.pricePaid === "" ? null : Number(body?.pricePaid);

  if (!Number.isFinite(score) || score < 1 || score > 5) {
    return Response.json({ error: "score must be 1-5" }, { status: 400 });
  }
  if (!notes) {
    return Response.json({ error: "notes are required" }, { status: 400 });
  }
  if (!Number.isFinite(pricePaid)) {
    return Response.json({ error: "price paid is required" }, { status: 400 });
  }

  const ratingId = addRating(id, {
    score,
    notes,
    pricePaid,
    createdBy: session.user.email,
  });

  return Response.json({ id: ratingId });
}
