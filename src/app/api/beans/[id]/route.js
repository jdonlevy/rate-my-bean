import { getBeanById, getRatingsForBean } from "@/lib/db";

export async function GET(_request, { params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid bean id" }, { status: 400 });
  }

  const bean = getBeanById(id);
  if (!bean) {
    return Response.json({ error: "Bean not found" }, { status: 404 });
  }

  const ratings = getRatingsForBean(id);
  return Response.json({ bean, ratings });
}
