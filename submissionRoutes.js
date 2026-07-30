import express from 'express';
import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.js';
import { gradeObjectiveAnswers } from '../utils/grading.js';
import { MANUAL_GRADED_TYPES } from '../models/Question.js';

const router = express.Router();

/* ----------------------------------------------------------
   POST /api/submissions/:examId
   Student submits. Objective questions are auto-graded and
   scored server-side; manual questions are stored as pending.
   No score of any kind is returned to the student here.
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

export default router;
