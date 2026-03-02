import { getBeanImagesById } from "@/lib/db";

export async function GET(request, { params }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return new Response("Invalid bean id", { status: 400 });
  }

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  if (!["bag", "coffee"].includes(kind)) {
    return new Response("Invalid image kind", { status: 400 });
  }

  const images = getBeanImagesById(id);
  if (!images) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = kind === "bag" ? images.bag_image : images.coffee_image;
  const type = kind === "bag" ? images.bag_image_type : images.coffee_image_type;

  if (!buffer || !type) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(buffer, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "no-store",
    },
  });
}
