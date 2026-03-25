import { auth } from "@/auth";
import { getBeanPongLeaderboard, submitBeanPongScore } from "@/lib/db";

export async function POST(request) {
  const session = await auth();
  const payload = await request.json().catch(() => ({}));
  const score = Number(payload.score);
  const displayName = String(payload.displayName || "").trim().slice(0, 15);
  if (!displayName || !Number.isFinite(score)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  await submitBeanPongScore({
    userId: session?.user?.id || null,
    displayName,
    score,
  });

  const leaderboard = await getBeanPongLeaderboard(10);
  return Response.json({ leaderboard });
}
