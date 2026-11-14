import { PASS_PERCENT } from "../config/rewards.js";

export type QuizResult = {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  // Per question: whether the answer was right, and which option was right.
  results: Array<{ correct: boolean; correctIndex: number }>;
};

// Checks answers against the stored correct answers. Runs only on the server.
// Returns null if the number of answers does not match the number of questions.
export function gradeQuiz(questions: Array<{ correctIndex: number }>, answers: number[]): QuizResult | null {
  if (answers.length !== questions.length) return null;

  let correct = 0;
  const results = questions.map((q, i) => {
    const ok = answers[i] === q.correctIndex;
    if (ok) correct += 1;
    return { correct: ok, correctIndex: q.correctIndex };
  });

  const total = questions.length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, percent, passed: total > 0 && percent >= PASS_PERCENT, results };
}