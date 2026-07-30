import mongoose from 'mongoose';

export const AUTO_GRADED_TYPES = ['mcq', 'true_false', 'fill_blank'];
export const MANUAL_GRADED_TYPES = ['short_answer'];
export const ALL_QUESTION_TYPES = [...AUTO_GRADED_TYPES, ...MANUAL_GRADED_TYPES];

const questionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    type: { type: String, enum: ALL_QUESTION_TYPES, required: true },
    text: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    topic: { type: String, default: '' },
    explanation: { type: String, default: '' },

    // mcq / true_false only
    options: { type: [String], default: undefined },
    correctOptionIndex: { type: Number, default: undefined },

    // fill_blank only
    acceptedAnswers: { type: [String], default: undefined },

    // Auto-graded types use `marks`; manual types use `maxMarks`.
    marks: { type: Number, min: 0 },
    maxMarks: { type: Number, min: 0 },
  },
  { timestamps: true }
);

questionSchema.pre('validate', function (next) {
  if (AUTO_GRADED_TYPES.includes(this.type) && (this.marks == null)) {
    return next(new Error(`Question type "${this.type}" requires a "marks" value.`));
  }
  if (MANUAL_GRADED_TYPES.includes(this.type) && (this.maxMarks == null)) {
    return next(new Error(`Question type "${this.type}" requires a "maxMarks" value.`));
  }
  if ((this.type === 'mcq' || this.type === 'true_false')) {
    if (!this.options || this.options.length < 2) {
      return next(new Error('mcq/true_false questions need at least 2 options.'));
    }
    if (this.correctOptionIndex == null || this.correctOptionIndex >= this.options.length) {
      return next(new Error('correctOptionIndex must reference a valid option.'));
    }
  }
  if (this.type === 'fill_blank' && (!this.acceptedAnswers || this.acceptedAnswers.length === 0)) {
    return next(new Error('fill_blank questions need at least one accepted answer.'));
  }
  next();
});

// Returns the marks value regardless of whether the question is auto or manually graded.
questionSchema.methods.maxScore = function () {
  return this.marks ?? this.maxMarks ?? 0;
};

export default mongoose.model('Question', questionSchema);
