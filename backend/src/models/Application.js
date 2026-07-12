const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    resumeKey: { type: String }, // S3 object key
    resumeUrl: { type: String }, // Presigned or public URL
    resumeFileName: { type: String },
    coverLetter: { type: String, maxlength: 3000 },
    linkedIn: { type: String },
    portfolio: { type: String },
    status: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'],
      default: 'applied',
    },
    // AI Analysis Result
    aiAnalysis: {
      matchScore: { type: Number, min: 0, max: 100 },
      skillsMatched: [{ type: String }],
      skillsMissing: [{ type: String }],
      experienceSummary: { type: String },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      summary: { type: String },
      suggestedQuestions: [{ type: String }],
      analyzedAt: { type: Date },
      isAnalyzed: { type: Boolean, default: false },
      isAnalyzing: { type: Boolean, default: false },
      error: { type: String },
    },
    // Recruiter notes
    notes: [
      {
        content: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Status history for activity feed
    statusHistory: [
      {
        from: { type: String },
        to: { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    kanbanOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ applicant: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
