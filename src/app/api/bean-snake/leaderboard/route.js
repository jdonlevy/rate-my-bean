import { getBeanSnakeLeaderboard } from "@/lib/db";

export async function GET() {
  const leaderboard = await getBeanSnakeLeaderboard(10);
  return Response.json({ leaderboard });
}
