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

  const body = await request.formData();
  const score = Number(body?.get("score"));
  const notes = body?.get("notes")?.toString().trim() || "";
  const pricePaidRaw = body?.get("pricePaid");
  const pricePaid = pricePaidRaw === "" || pricePaidRaw == null ? null : Number(pricePaidRaw);
  const bagImage = body.get("bagImage");
  const coffeeImage = body.get("coffeeImage");

  if (!Number.isFinite(score) || score < 1 || score > 5) {
    return Response.json({ error: "score must be 1-5" }, { status: 400 });
  }
  if (!notes) {
    return Response.json({ error: "notes are required" }, { status: 400 });
  }
  if (!Number.isFinite(pricePaid)) {
    return Response.json({ error: "price paid is required" }, { status: 400 });
  }

  const maxBytes = 5 * 1024 * 1024;
  const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
  ]);

  async function readImage(file) {
    if (!file || typeof file === "string") {
      return { buffer: null, type: null };
    }
    if (file.size > maxBytes) {
      throw new Error("Images must be 5MB or smaller.");
    }
    if (!allowedTypes.has(file.type)) {
      throw new Error("Only JPEG, PNG, or HEIC images are allowed.");
    }
    const arrayBuffer = await file.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), type: file.type };
  }

  let bagImageData = { buffer: null, type: null };
  let coffeeImageData = { buffer: null, type: null };

  try {
    bagImageData = await readImage(bagImage);
    coffeeImageData = await readImage(coffeeImage);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  const ratingId = await addRating(id, {
    score,
    notes,
    pricePaid,
    createdBy: session.user.email,
    bagImage: bagImageData.buffer,
    bagImageType: bagImageData.type,
    coffeeImage: coffeeImageData.buffer,
    coffeeImageType: coffeeImageData.type,
  });

  return Response.json({ id: ratingId });
}
