import { auth } from "@/auth";
import {
  getBeanometerStats,
  getOrCreateDailyQuiz,
  getUserQuizAnswer,
  submitDailyQuizAnswer,
} from "@/lib/db";

export async function POST(request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const selectedIndex = Number(payload.selectedIndex);
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
    return Response.json({ error: "Invalid selection" }, { status: 400 });
  }

  const quiz = await getOrCreateDailyQuiz();
  if (!quiz.question) {
    return Response.json({ error: "Quiz unavailable" }, { status: 500 });
  }

  const existing = await getUserQuizAnswer(userId, quiz.dateKey);
  if (existing) {
    const stats = await getBeanometerStats(userId);
    return Response.json(
      {
        answer: {
          selectedIndex: existing.selected_index,
          correct: Boolean(existing.correct),
        },
        beanometer: stats,
        alreadyAnswered: true,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const result = await submitDailyQuizAnswer(userId, selectedIndex, quiz.dateKey);
  const stats = await getBeanometerStats(userId);

  return Response.json(
    {
      answer: {
        selectedIndex,
        correct: Boolean(result.correct),
      },
      beanometer: stats,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
