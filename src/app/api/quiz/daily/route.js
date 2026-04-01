import { auth } from "@/auth";
import {
  getBeanometerStats,
  getOrCreateDailyQuiz,
  getUserQuizAnswer,
} from "@/lib/db";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quiz = await getOrCreateDailyQuiz();
  if (!quiz.question) {
    return Response.json({ error: "Quiz unavailable" }, { status: 500 });
  }

  const answer = await getUserQuizAnswer(userId, quiz.dateKey);
  const stats = await getBeanometerStats(userId);

  return Response.json(
    {
      date: quiz.dateKey,
      question: {
        id: quiz.question.id,
        text: quiz.question.question,
        options: [
          quiz.question.option_a,
          quiz.question.option_b,
          quiz.question.option_c,
          quiz.question.option_d,
        ],
        fact: quiz.question.fact,
      },
      answer: answer
        ? { selectedIndex: answer.selected_index, correct: Boolean(answer.correct) }
        : null,
      beanometer: stats,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
