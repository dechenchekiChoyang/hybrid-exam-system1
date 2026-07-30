import { AUTO_GRADED_TYPES } from '../models/Question.js';

function normalize(str) {
  return (str ?? '').toString().trim().toLowerCase();
}

// Grades the auto-gradable questions in a submission against the real
// Question documents (never the client's own claim of correctness).
// Returns per-question correctness plus the aggregate auto score,
// but callers decide whether/when to expose any of this to the student.
export function gradeObjectiveAnswers(questions, answers) {
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
  let autoScore = 0;
  let autoPossible = 0;
  const perQuestion = {};

  for (const ans of answers) {
    const q = questionMap.get(ans.question.toString());
    if (!q || !AUTO_GRADED_TYPES.includes(q.type)) continue;

    autoPossible += q.marks;
    let correct = false;

    if (q.type === 'fill_blank') {
      correct = ans.textAnswer != null && q.acceptedAnswers.some((a) => normalize(a) === normalize(ans.textAnswer));
    } else {
      correct = ans.selectedOptionIndex === q.correctOptionIndex;
    }

    if (correct) autoScore += q.marks;
    perQuestion[q._id.toString()] = { correct, marksAwarded: correct ? q.marks : 0 };
  }

  return { autoScore, autoPossible, perQuestion };
}
