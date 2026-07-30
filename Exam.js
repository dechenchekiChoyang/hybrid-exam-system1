import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, default: '' },
    description: { type: String, default: '' },
    instructions: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    durationMinutes: { type: Number, required: true, min: 1 },
    passingMarks: { type: Number, required: true, min: 0 },
    maxAttempts: { type: Number, default: 1, min: 1 },
    negativeMarking: { type: Boolean, default: false },

    questionPool: {
      bank: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
      countToServe: { type: Number, required: true, min: 1 },
      randomize: { type: Boolean, default: true },
    },
    shuffleOptions: { type: Boolean, default: false },

    startWindow: { type: Date },
    endWindow: { type: Date },
    maxTabSwitchViolations: { type: Number, default: 3 },
    autoSubmit: { type: Boolean, default: true },

    // Result visibility — the no-disclosure rule lives here.
    showScoreImmediately: { type: Boolean, default: false },
    showAnswersImmediately: { type: Boolean, default: false },
    manualPublishRequired: { type: Boolean, default: true },

    isPublished: { type: Boolean, default: false }, // exam visible to students at all
  },
  { timestamps: true }
);

export default mongoose.model('Exam', examSchema);
