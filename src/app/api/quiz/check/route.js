import { auth } from "@/auth";
import { getQuizQuestionById } from "@/lib/db";

export async function POST(request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const questionId = Number(payload.questionId);
  const selectedIndex = Number(payload.selectedIndex);
  if (!Number.isInteger(questionId) || !Number.isInteger(selectedIndex)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const question = await getQuizQuestionById(questionId);
  if (!question) {
    return Response.json({ error: "Quiz unavailable" }, { status: 500 });
  }

  const correct = Number(selectedIndex) === Number(question.correct_index);
  return Response.json({
    correct,
    fact: question.fact,
  });
}
