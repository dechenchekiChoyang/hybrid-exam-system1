import express from 'express';
import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// POST /api/exams — instructor/admin creates an exam shell (questions added separately)
router.post('/', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const {
      title, subject, description, instructions,
      durationMinutes, passingMarks, maxAttempts, negativeMarking,
      countToServe, randomize, shuffleOptions,
      startWindow, endWindow, maxTabSwitchViolations, autoSubmit,
      showScoreImmediately, showAnswersImmediately, manualPublishRequired,
    } = req.body;

    if (!title || !durationMinutes || passingMarks == null || !countToServe) {
      return res.status(400).json({ message: 'title, durationMinutes, passingMarks, and countToServe are required.' });
    }

    const exam = await Exam.create({
      title, subject, description, instructions,
      createdBy: req.user.id,
      durationMinutes, passingMarks,
      maxAttempts, negativeMarking,
      questionPool: { bank: [], countToServe, randomize: randomize ?? true },
      shuffleOptions,
      startWindow, endWindow,
      maxTabSwitchViolations, autoSubmit,
      showScoreImmediately, showAnswersImmediately, manualPublishRequired,
    });

    res.status(201).json(exam);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/exams/:examId/publish — make the exam visible to students
router.patch('/:examId/publish', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.examId, { isPublished: true }, { new: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    res.json(exam);
  } catch (err) {
    next(err);
  }
});

// GET /api/exams/:examId/attempt — student-facing, correct answers stripped
router.get('/:examId/attempt', verifyJWT, authorizeRoles('student'), async (req, res, next) => {
  try {
    const { examId } = req.params;
    if (!mongoose.isValidObjectId(examId)) {
      return res.status(400).json({ message: 'Invalid exam ID.' });
    }

    const exam = await Exam.findById(examId).lean();
    if (!exam || !exam.isPublished) {
      return res.status(404).json({ message: 'Exam not found or unavailable.' });
    }

    const now = new Date();
    if (exam.startWindow && now < exam.startWindow) {
      return res.status(403).json({ message: 'Exam has not started yet.' });
    }
    if (exam.endWindow && now > exam.endWindow) {
      return res.status(403).json({ message: 'Exam window has closed.' });
    }

    const { bank, countToServe, randomize } = exam.questionPool;
    let selectedIds = randomize
      ? [...bank].sort(() => Math.random() - 0.5).slice(0, countToServe)
      : bank.slice(0, countToServe);

    // Field-level exclusion — correctOptionIndex / acceptedAnswers never leave the server.
    const questions = await Question.find({ _id: { $in: selectedIds } })
      .select('-correctOptionIndex -acceptedAnswers -explanation')
      .lean();

    res.json({
      examId: exam._id,
      title: exam.title,
      subject: exam.subject,
      description: exam.description,
      instructions: exam.instructions,
      durationMinutes: exam.durationMinutes,
      passingMarks: exam.passingMarks,
      maxTabSwitchViolations: exam.maxTabSwitchViolations,
      questions,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
