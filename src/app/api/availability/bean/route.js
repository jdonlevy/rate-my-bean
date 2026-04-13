import { auth } from "@/auth";
import { markBeanSeenToday } from "@/lib/db";

export async function POST(request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const beanId = Number(payload.beanId);
  const roasteryId = Number(payload.roasteryId);
  if (!Number.isInteger(beanId) || !Number.isInteger(roasteryId)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const lastSeen = await markBeanSeenToday({
    userId,
    beanId,
    roasteryId,
  });

  return Response.json({ lastSeen }, { headers: { "Cache-Control": "no-store" } });
}
