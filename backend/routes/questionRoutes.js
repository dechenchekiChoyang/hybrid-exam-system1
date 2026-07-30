import express from 'express';
import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// POST /api/exams/:examId/questions — add a question to an exam's bank
router.post('/:examId/questions', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    const question = await Question.create({ ...req.body, exam: examId });
    exam.questionPool.bank.push(question._id);
    await exam.save();

    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
});

// GET /api/exams/:examId/questions — instructor/admin view, with answers included
router.get('/:examId/questions', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const { examId } = req.params;
    if (!mongoose.isValidObjectId(examId)) {
      return res.status(400).json({ message: 'Invalid exam ID.' });
    }
    const questions = await Question.find({ exam: examId }).lean();
    res.json(questions);
  } catch (err) {
    next(err);
  }
});

// PUT /api/exams/:examId/questions/:questionId — update an existing question
router.put('/:examId/questions/:questionId', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const { examId, questionId } = req.params;

    if (!mongoose.isValidObjectId(examId)) {
      return res.status(400).json({ message: 'Invalid exam ID.' });
    }
    if (!mongoose.isValidObjectId(questionId)) {
      return res.status(400).json({ message: 'Invalid question ID.' });
    }

    // Verify the question belongs to this exam
    const question = await Question.findOne({ _id: questionId, exam: examId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found in this exam.' });
    }

    const {
      type, text, difficulty, topic, explanation,
      options, correctOptionIndex, acceptedAnswers,
      marks, maxMarks,
    } = req.body;

    // Update type-specific fields
    if (type !== undefined) question.type = type;
    if (text !== undefined) question.text = text;
    if (difficulty !== undefined) question.difficulty = difficulty;
    if (topic !== undefined) question.topic = topic;
    if (explanation !== undefined) question.explanation = explanation;

    // mcq / true_false fields
    if (options !== undefined) question.options = options;
    if (correctOptionIndex !== undefined) question.correctOptionIndex = correctOptionIndex;

    // fill_blank fields
    if (acceptedAnswers !== undefined) question.acceptedAnswers = acceptedAnswers;

    // marks
    if (marks !== undefined) question.marks = marks;
    if (maxMarks !== undefined) question.maxMarks = maxMarks;

    // Clear conflicting fields when type changes
    if (type !== undefined) {
      if (type === 'short_answer') {
        question.options = undefined;
        question.correctOptionIndex = undefined;
        question.acceptedAnswers = undefined;
        question.marks = undefined;
      } else if (type === 'fill_blank') {
        question.options = undefined;
        question.correctOptionIndex = undefined;
        question.maxMarks = undefined;
      } else {
        // mcq / true_false
        question.acceptedAnswers = undefined;
        question.maxMarks = undefined;
      }
    }

    await question.save(); // triggers pre-validate hook
    res.json(question);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/exams/:examId/questions/:questionId
router.delete('/:examId/questions/:questionId', verifyJWT, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const { examId, questionId } = req.params;
    await Question.findOneAndDelete({ _id: questionId, exam: examId });
    await Exam.findByIdAndUpdate(examId, { $pull: { 'questionPool.bank': questionId } });
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
