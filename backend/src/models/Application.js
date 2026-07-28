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
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resumeKey: { type: String },
    resumeUrl: { type: String },
    resumeFileName: { type: String },
    coverLetter: { type: String, maxlength: 3000 },
    linkedIn: { type: String },
    github: { type: String },
    portfolio: { type: String },
    
    // Hiring Pipeline Stages (9 Stages)
    status: {
      type: String,
      enum: [
        'applied',
        'screening',
        'assessment',
        'interview',
        'technical_round',
        'hr_round',
        'offered',
        'accepted',
        'rejected',
      ],
      default: 'applied',
    },
    
    // AI Score & Advanced Multi-Factor Analysis
    aiScore: { type: Number, min: 0, max: 100, default: 0 },
    aiSummary: { type: String },
    scoreBreakdown: {
      technicalScore: { type: Number, default: 0 },
      semanticScore: { type: Number, default: 0 },
      experienceScore: { type: Number, default: 0 },
      educationScore: { type: Number, default: 0 },
      projectScore: { type: Number, default: 0 },
      certificationScore: { type: Number, default: 0 },
      resumeQuality: { type: Number, default: 0 },
      softSkillScore: { type: Number, default: 0 },
      portfolioScore: { type: Number, default: 0 },
      locationMatch: { type: Number, default: 100 },
    },
    aiAnalysis: {
      skillsMatched: [{ type: String }],
      skillsMissing: [{ type: String }],
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      resumeSuggestions: [{ type: String }],
      projectRelevance: [{ type: String }],
      hiringRecommendation: { type: String, default: 'Possible Hire' },
      recommendation: { type: String },
      interviewProbability: { type: String },
      explanation: { type: String },
      fakeResumeFlag: { type: Boolean, default: false },
      biasDetected: { type: Boolean, default: false },
      biasDetails: { type: String },
      analyzedAt: { type: Date },
      isAnalyzed: { type: Boolean, default: false },
      error: { type: String },
    },
    
    // Recruiter & Interview Evaluations
    interviewScore: { type: Number, min: 0, max: 10, default: 0 },
    recruiterRating: { type: Number, min: 1, max: 5, default: 3 },
    recruiterNotes: [
      {
        content: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedByName: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    
    // Pipeline History
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
    appliedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ company: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
