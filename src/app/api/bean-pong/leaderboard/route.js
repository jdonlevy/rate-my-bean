import { getBeanPongLeaderboard } from "@/lib/db";

export async function GET() {
  const leaderboard = await getBeanPongLeaderboard(10);
  return Response.json({ leaderboard });
}
