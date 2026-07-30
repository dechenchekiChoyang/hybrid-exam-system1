import express from 'express';
import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.js';
import { gradeObjectiveAnswers } from '../utils/grading.js';
import { MANUAL_GRADED_TYPES } from '../models/Question.js';

const router = express.Router();

/* ── Helper: compute remaining time for an in-progress submission ── */
function timerPayload(submission, exam) {
  const endsAt = new Date(submission.startedAt.getTime() + exam.durationMinutes * 60 * 1000);
  const remainingSeconds = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
  return {
    submissionId: submission._id,
    startedAt: submission.startedAt,
    endsAt,
    remainingSeconds,
    expired: remainingSeconds <= 0,
    durationMinutes: exam.durationMinutes,
  };
}

/* ----------------------------------------------------------
   POST /api/submissions/:examId/start
   Student begins or resumes an exam. Records server-side
   startedAt so the backend is the authority for timing.
---------------------------------------------------------- */
router.post('/:examId/start', verifyJWT, authorizeRoles('student'), async (req, res, next) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    const exam = await Exam.findById(examId).lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    if (!exam.isPublished) return res.status(403).json({ message: 'Exam is not available.' });

    // Check window
    const now = new Date();
    if (exam.startWindow && now < exam.startWindow) return res.status(403).json({ message: 'Exam has not started yet.' });
    if (exam.endWindow && now > exam.endWindow) return res.status(403).json({ message: 'Exam window has closed.' });

    // Resume existing in-progress submission
    let submission = await Submission.findOne({ student: studentId, exam: examId, status: 'in-progress' });

    if (!submission) {
      const attemptCount = await Submission.countDocuments({ student: studentId, exam: examId });
      if (attemptCount >= (exam.maxAttempts || 1)) {
        return res.status(400).json({ message: 'Maximum attempts reached for this exam.' });
      }
      submission = await Submission.create({
        student: studentId,
        exam: examId,
        status: 'in-progress',
        startedAt: new Date(),
      });
    }

    res.json(timerPayload(submission, exam));
  } catch (err) {
    next(err);
  }
});

/* ----------------------------------------------------------
   GET /api/submissions/:examId/timer
   Student fetches remaining time for an ongoing exam.
---------------------------------------------------------- */
router.get('/:examId/timer', verifyJWT, authorizeRoles('student'), async (req, res, next) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    const exam = await Exam.findById(examId).lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    const submission = await Submission.findOne({ student: studentId, exam: examId }).lean();
    if (!submission) {
      return res.status(404).json({ message: 'No active exam session found.' });
    }

    if (submission.status !== 'in-progress') {
      return res.json({
        submissionId: submission._id,
        startedAt: submission.startedAt,
        submittedAt: submission.submittedAt,
        remainingSeconds: 0,
        expired: true,
        status: submission.status,
        durationMinutes: exam.durationMinutes,
      });
    }

    res.json(timerPayload(submission, exam));
  } catch (err) {
    next(err);
  }
});

/* ----------------------------------------------------------
   POST /api/submissions/:examId/save
   Student saves answers mid-exam. Enforces timer.
---------------------------------------------------------- */
router.post('/:examId/save', verifyJWT, authorizeRoles('student'), async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body;
    const studentId = req.user.id;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers must be an array.' });
    }

    const exam = await Exam.findById(examId).lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    const submission = await Submission.findOne({ student: studentId, exam: examId, status: 'in-progress' });
    if (!submission) {
      return res.status(400).json({ message: 'No active exam session. Start the exam first.' });
    }

    // Enforce timer
    const endsAt = new Date(submission.startedAt.getTime() + exam.durationMinutes * 60 * 1000);
    if (Date.now() >= endsAt) {
      submission.status = 'submitted';
      submission.submittedAt = new Date();
      submission.answers = answers;
      await submission.save();
      return res.status(400).json({ message: 'Exam time has expired. Your answers have been auto-submitted.' });
    }

    submission.answers = answers;
    await submission.save();

    res.json({ message: 'Answers saved.', savedAt: new Date() });
  } catch (err) {
    next(err);
  }
});

/* ----------------------------------------------------------
   POST /api/submissions/:examId
   Student submits. Objective questions are auto-graded and
   scored server-side; manual questions are stored as pending.
   No score of any kind is returned to the student here.
   ENFORCES server-side timer — rejects if time expired.
---------------------------------------------------------- */
router.post('/:examId', verifyJWT, authorizeRoles('student'), async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body; // [{ question, selectedOptionIndex?, textAnswer? }]
    const studentId = req.user.id;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers must be an array.' });
    }

    const exam = await Exam.findById(examId).lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    // ── Server-side timer enforcement ──
    const startedSub = await Submission.findOne({ student: studentId, exam: examId }).lean();
    if (startedSub && startedSub.startedAt) {
      const endsAt = new Date(startedSub.startedAt.getTime() + exam.durationMinutes * 60 * 1000);
      if (Date.now() > endsAt) {
        return res.status(400).json({
          message: 'Exam time has expired. Your submission cannot be accepted.',
          expired: true,
        });
      }
    }

    const questionIds = answers.map((a) => a.question);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const { autoScore, autoPossible } = gradeObjectiveAnswers(questions, answers);

    const manualQuestions = questions.filter((q) => MANUAL_GRADED_TYPES.includes(q.type));
    const manualPossible = manualQuestions.reduce((sum, q) => sum + (q.maxMarks || 0), 0);

    const submission = await Submission.findOneAndUpdate(
      { student: studentId, exam: examId },
      {
        student: studentId,
        exam: examId,
        answers,
        autoScore,
        autoPossible,
        manualPossible,
        manualGrades: [],
        status: 'submitted',
        submittedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Deliberately no score/marks/correctness in this response.
    res.status(201).json({
      message: 'Your examination has been submitted successfully.',
      detail:
        manualQuestions.length > 0
          ? 'Objective questions have been graded automatically. Subjective questions are pending instructor review. Results will be available after they are officially published.'
          : 'Your exam has been graded automatically. Results will be available after your instructor publishes them.',
      submissionId: submission._id,
    });
  } catch (err) {
    next(err);
  }
});

/* ----------------------------------------------------------
   GET /api/submissions/exam/:examId
   Instructor: list submissions for an exam (grading queue).
---------------------------------------------------------- */
router.get('/exam/:examId', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const submissions = await Submission.find({ exam: req.params.examId })
      .populate('student', 'fullName email')
      .lean();
    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

/* ----------------------------------------------------------
   GET /api/submissions/my-history
   Student: list all of the logged-in student's submissions
   with exam info, scores, and pass/fail status.
---------------------------------------------------------- */
router.get('/my-history', verifyJWT, authorizeRoles('student'), async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const submissions = await Submission.find({ student: studentId })
      .sort({ submittedAt: -1 })
      .lean();

    // Collect unique exam IDs
    const examIds = [...new Set(submissions.map((s) => s.exam.toString()))];
    const exams = await Exam.find({ _id: { $in: examIds } }).lean();
    const examMap = new Map(exams.map((e) => [e._id.toString(), e]));

    const history = submissions.map((sub) => {
      const exam = examMap.get(sub.exam.toString()) || {};
      const totalMarks = sub.autoPossible + (sub.manualPossible || 0);
      const score = sub.finalScore ?? (sub.autoScore + (sub.manualScore || 0));
      const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : null;
      const passed = exam.passingMarks != null && score != null ? score >= exam.passingMarks : null;

      return {
        _id: sub._id,
        examId: exam._id,
        title: exam.title || 'Untitled Exam',
        subject: exam.subject || '',
        submittedAt: sub.submittedAt || sub.createdAt,
        status: sub.status,
        score,
        totalMarks,
        percentage,
        passingMarks: exam.passingMarks,
        passed,
        finalScore: sub.finalScore,
      };
    });

    res.json(history);
  } catch (err) {
    next(err);
  }
});

/* ----------------------------------------------------------
   GET /api/submissions/:submissionId
   Instructor: full detail (answers + question text) for grading.
---------------------------------------------------------- */
router.get('/:submissionId', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('student', 'fullName email')
      .lean();
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    const questionIds = submission.answers.map((a) => a.question);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    res.json({ ...submission, questions });
  } catch (err) {
    next(err);
  }
});

/* ----------------------------------------------------------
   PATCH /api/submissions/:submissionId/grade
   Instructor grades one manual (short_answer) question.
   Body: { questionId, marks, feedback }
---------------------------------------------------------- */
router.patch('/:submissionId/grade', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { questionId, marks, feedback } = req.body;

    if (!questionId || marks == null) {
      return res.status(400).json({ message: 'questionId and marks are required.' });
    }

    const question = await Question.findById(questionId).lean();
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    if (marks < 0 || marks > question.maxMarks) {
      return res.status(400).json({ message: `marks must be between 0 and ${question.maxMarks}.` });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    const existingIdx = submission.manualGrades.findIndex((g) => g.question.toString() === questionId);
    const gradeEntry = { question: questionId, marks, feedback: feedback || '', gradedBy: req.user.id, gradedAt: new Date() };

    if (existingIdx >= 0) submission.manualGrades[existingIdx] = gradeEntry;
    else submission.manualGrades.push(gradeEntry);

    submission.manualScore = submission.manualGrades.reduce((sum, g) => sum + g.marks, 0);
    submission.status = 'graded'; // finer-grained "fully graded" check happens at publish time
    await submission.save();

    res.json(submission);
  } catch (err) {
    next(err);
  }
});

/* ----------------------------------------------------------
   POST /api/submissions/:submissionId/publish
   Instructor/admin publishes — this is the only action that
   makes finalScore visible to the student.
---------------------------------------------------------- */
router.post('/:submissionId/publish', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    const questionIds = submission.answers.map((a) => a.question);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    const manualQuestionIds = questions.filter((q) => MANUAL_GRADED_TYPES.includes(q.type)).map((q) => q._id.toString());

    const gradedIds = new Set(submission.manualGrades.map((g) => g.question.toString()));
    const allManualGraded = manualQuestionIds.every((id) => gradedIds.has(id));

    if (!allManualGraded) {
      return res.status(400).json({ message: 'All manually-graded questions must be scored before publishing.' });
    }

    submission.finalScore = submission.autoScore + submission.manualScore;
    submission.status = 'published';
    submission.publishedAt = new Date();
    await submission.save();

    res.json(submission);
  } catch (err) {
    next(err);
  }
});

/* ----------------------------------------------------------
   GET /api/submissions/:submissionId/result
   Student: only returns data if status === 'published', and
   only if the submission belongs to the requesting student.
---------------------------------------------------------- */
router.get('/:submissionId/result', verifyJWT, authorizeRoles('student'), async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.submissionId).lean();
    if (!submission || submission.student.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    if (submission.status !== 'published') {
      return res.status(403).json({ message: 'Results have not been published yet.' });
    }

    const exam = await Exam.findById(submission.exam).lean();
    const questionIds = submission.answers.map((a) => a.question);
    const questions = await Question.find({ _id: { $in: questionIds } })
      .select('-acceptedAnswers') // still no raw accepted-answer list, only pass/fail per question
      .lean();

    res.json({
      finalScore: submission.finalScore,
      totalMarks: submission.autoPossible + submission.manualPossible,
      passingMarks: exam.passingMarks,
      manualFeedback: submission.manualGrades.map((g) => ({ question: g.question, marks: g.marks, feedback: g.feedback })),
      questions,
    });
  } catch (err) {
    next(err);
  }
});

/* ----------------------------------------------------------
   GET /api/submissions/:submissionId/marksheet
   Student: returns populated data for PDF marksheet generation.
   Requires published status + ownership.
---------------------------------------------------------- */
router.get('/:submissionId/marksheet', verifyJWT, authorizeRoles('student'), async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('student', 'fullName email department enrollmentId role')
      .populate('exam', 'title subject durationMinutes passingMarks')
      .lean();

    if (!submission || submission.student._id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    if (submission.status !== 'published') {
      return res.status(403).json({ message: 'Marksheet is available only after the result is published.' });
    }

    const totalMarks = submission.autoPossible + (submission.manualPossible || 0);
    const percentage = totalMarks > 0 ? Math.round((submission.finalScore / totalMarks) * 100) : 0;
    const passed = submission.finalScore >= (submission.exam?.passingMarks || 0);

    let grade = 'F';
    if (passed) {
      if (percentage >= 90) grade = 'O';
      else if (percentage >= 80) grade = 'A+';
      else if (percentage >= 70) grade = 'A';
      else if (percentage >= 60) grade = 'B+';
      else if (percentage >= 50) grade = 'B';
      else grade = 'C';
    }

    res.json({
      student: {
        fullName: submission.student.fullName,
        email: submission.student.email,
        department: submission.student.department,
        enrollmentId: submission.student.enrollmentId,
        role: submission.student.role,
      },
      exam: {
        title: submission.exam.title,
        subject: submission.exam.subject,
        durationMinutes: submission.exam.durationMinutes,
        passingMarks: submission.exam.passingMarks,
      },
      result: {
        finalScore: submission.finalScore,
        totalMarks,
        percentage,
        grade,
        passed,
        publishedAt: submission.publishedAt,
        status: submission.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
