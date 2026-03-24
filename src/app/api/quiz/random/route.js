import { auth } from "@/auth";
import { getRandomQuizQuestion } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const question = await getRandomQuizQuestion();
  if (!question) {
    return Response.json({ error: "Quiz unavailable" }, { status: 500 });
  }

  return Response.json({
    question: {
      id: question.id,
      text: question.question,
      options: [question.option_a, question.option_b, question.option_c, question.option_d],
      fact: question.fact,
    },
  });
}
