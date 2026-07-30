import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    // mcq / true_false
    selectedOptionIndex: { type: Number, default: null },
    // fill_blank / short_answer
    textAnswer: { type: String, default: null },
  },
  { _id: false }
);

const manualGradeSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    marks: { type: Number, required: true, min: 0 },
    feedback: { type: String, default: '' },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gradedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    answers: [answerSchema],

    autoScore: { type: Number, default: 0 },
    autoPossible: { type: Number, default: 0 },
    manualGrades: [manualGradeSchema],
    manualScore: { type: Number, default: 0 },
    manualPossible: { type: Number, default: 0 },
    finalScore: { type: Number, default: null },

    tabSwitchViolations: { type: Number, default: 0 },

    status: {
      type: String,
      // in-progress: student is mid-exam (optional use, e.g. autosave)
      // submitted: student finished, auto-grade done, manual grading pending
      // graded: instructor finished manual grading, not yet published
      // published: student can see finalScore + breakdown
      enum: ['in-progress', 'submitted', 'graded', 'published'],
      default: 'in-progress',
    },

    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

submissionSchema.index({ student: 1, exam: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
