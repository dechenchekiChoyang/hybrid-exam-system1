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
