import express from 'express';
import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
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

// GET /api/exams — list all exams (instructor/admin only)
router.get('/', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const exams = await Exam.find()
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(exams);
  } catch (err) {
    next(err);
  }
});

// GET /api/exams/available — student-facing: list published exams (basic info only, no answers)
router.get('/available', verifyJWT, authorizeRoles('student'), async (req, res, next) => {
  try {
    const exams = await Exam.find({ isPublished: true })
      .select('title subject description instructions durationMinutes passingMarks questionPool maxTabSwitchViolations createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json(exams);
  } catch (err) {
    next(err);
  }
});

// GET /api/exams/instructor/dashboard — faculty dashboard statistics
router.get('/instructor/dashboard', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const instructorId = req.user.id;

    // All exams created by this instructor
    const exams = await Exam.find({ createdBy: instructorId }).lean();
    const examIds = exams.map((e) => e._id);

    const totalExams = exams.length;
    const publishedExams = exams.filter((e) => e.isPublished).length;
    const draftExams = exams.filter((e) => !e.isPublished).length;

    // Questions across all exams by this instructor
    const totalQuestions = await Question.countDocuments({ exam: { $in: examIds } });

    // All submissions for this instructor's exams
    const totalSubmissions = await Submission.countDocuments({ exam: { $in: examIds } });

    // Submissions that are submitted but not yet graded or published
    const pendingManualGrading = await Submission.countDocuments({
      exam: { $in: examIds },
      status: 'submitted',
    });

    res.json({
      totalExams,
      publishedExams,
      draftExams,
      totalQuestions,
      pendingManualGrading,
      totalSubmissions,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/exams/:examId — get a single exam by ID (instructor/admin only)
router.get('/:examId', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const { examId } = req.params;
    if (!mongoose.isValidObjectId(examId)) {
      return res.status(400).json({ message: 'Invalid exam ID.' });
    }
    const exam = await Exam.findById(examId)
      .populate('createdBy', 'fullName email')
      .lean();
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }
    res.json(exam);
  } catch (err) {
    next(err);
  }
});

// PUT /api/exams/:examId — update an existing exam (instructor/admin only)
router.put('/:examId', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const { examId } = req.params;
    if (!mongoose.isValidObjectId(examId)) {
      return res.status(400).json({ message: 'Invalid exam ID.' });
    }

    const {
      title, subject, description, instructions,
      durationMinutes, passingMarks, maxAttempts, negativeMarking,
      countToServe, randomize, shuffleOptions,
      startWindow, endWindow, maxTabSwitchViolations, autoSubmit,
      showScoreImmediately, showAnswersImmediately, manualPublishRequired,
    } = req.body;

    // Build update object — only include fields that are actually sent
    const update = {};
    if (title !== undefined) update.title = title;
    if (subject !== undefined) update.subject = subject;
    if (description !== undefined) update.description = description;
    if (instructions !== undefined) update.instructions = instructions;
    if (durationMinutes !== undefined) update.durationMinutes = durationMinutes;
    if (passingMarks !== undefined) update.passingMarks = passingMarks;
    if (maxAttempts !== undefined) update.maxAttempts = maxAttempts;
    if (negativeMarking !== undefined) update.negativeMarking = negativeMarking;
    if (shuffleOptions !== undefined) update.shuffleOptions = shuffleOptions;
    if (startWindow !== undefined) update.startWindow = startWindow;
    if (endWindow !== undefined) update.endWindow = endWindow;
    if (maxTabSwitchViolations !== undefined) update.maxTabSwitchViolations = maxTabSwitchViolations;
    if (autoSubmit !== undefined) update.autoSubmit = autoSubmit;
    if (showScoreImmediately !== undefined) update.showScoreImmediately = showScoreImmediately;
    if (showAnswersImmediately !== undefined) update.showAnswersImmediately = showAnswersImmediately;
    if (manualPublishRequired !== undefined) update.manualPublishRequired = manualPublishRequired;

    // Question pool partial update
    if (countToServe !== undefined || randomize !== undefined) {
      const exam = await Exam.findById(examId);
      if (!exam) return res.status(404).json({ message: 'Exam not found.' });
      if (countToServe !== undefined) exam.questionPool.countToServe = countToServe;
      if (randomize !== undefined) exam.questionPool.randomize = randomize;
      await exam.save();
      // If only question pool fields changed, return now
      if (Object.keys(update).length === 0) {
        return res.json(exam);
      }
    }

    if (Object.keys(update).length > 0) {
      const exam = await Exam.findByIdAndUpdate(examId, update, { new: true, runValidators: true });
      if (!exam) return res.status(404).json({ message: 'Exam not found.' });
      return res.json(exam);
    }

    res.status(400).json({ message: 'No valid fields to update.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/exams/:examId — delete an exam and its associated questions (instructor/admin only)
router.delete('/:examId', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const { examId } = req.params;
    if (!mongoose.isValidObjectId(examId)) {
      return res.status(400).json({ message: 'Invalid exam ID.' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }

    // Delete all questions belonging to this exam
    await Question.deleteMany({ exam: examId });

    // Delete the exam itself
    await Exam.findByIdAndDelete(examId);

    res.json({ message: 'Exam and associated questions deleted successfully.' });
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
router.get('api/:examId/attempt', verifyJWT, authorizeRoles('student'), async (req, res, next) => {
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
