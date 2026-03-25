import { auth } from "@/auth";
import { getBeanSnakeLeaderboard, submitBeanSnakeScore } from "@/lib/db";

export async function POST(request) {
  const session = await auth();
  const payload = await request.json().catch(() => ({}));
  const score = Number(payload.score);
  const displayName = String(payload.displayName || "").trim();
  if (!displayName || !Number.isFinite(score)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  await submitBeanSnakeScore({
    userId: session?.user?.id || null,
    displayName,
    score,
  });

  const leaderboard = await getBeanSnakeLeaderboard(10);
  return Response.json({ leaderboard });
}
