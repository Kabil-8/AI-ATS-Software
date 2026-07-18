const mongoose = require('mongoose');

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const noteSchema = new mongoose.Schema(
  {
    content:  { type: String, required: true, maxlength: 2000 },
    addedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    from:      { type: String },
    to:        { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note:      { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

const offerDetailsSchema = new mongoose.Schema(
  {
    baseSalary: { type: Number },
    currency:   { type: String, default: 'USD' },
    equity:     { type: String },           // e.g. "0.5%"
    bonus:      { type: Number },
    startDate:  { type: Date },
    expiresAt:  { type: Date },
    notes:      { type: String, maxlength: 1000 },
  },
  { _id: false }
);

// ─── Application Schema ───────────────────────────────────────────────────────

const applicationSchema = new mongoose.Schema(
  {
    // ── Core references ───────────────────────────────────────────────────────
    job: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Job',
      required: [true, 'Job reference is required'],
    },
    applicant: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Applicant reference is required'],
    },

    // ── Resume ────────────────────────────────────────────────────────────────
    resumeKey:      { type: String },        // S3 object key
    resumeUrl:      { type: String },        // Presigned or public URL
    resumeFileName: { type: String },

    // ── Application content ───────────────────────────────────────────────────
    coverLetter: { type: String, maxlength: [3000, 'Cover letter cannot exceed 3000 characters'] },
    linkedIn:    { type: String },
    portfolio:   { type: String },

    // ── Pipeline status ───────────────────────────────────────────────────────
    /**
     * `status`  — The canonical business state (drives email notifications).
     *   applied → screening → interview → offered → hired | rejected
     */
    status: {
      type:    String,
      enum:    ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'],
      default: 'applied',
    },

    /**
     * `stage`  — The Kanban column / UI pipeline position.
     *   Kept separate from status so recruiters can move cards freely
     *   without triggering email notifications on every drag.
     */
    stage: {
      type:    String,
      enum:    ['new', 'reviewed', 'shortlisted', 'interview_scheduled', 'offer_extended', 'hired', 'rejected'],
      default: 'new',
    },

    // Recruiter manual star rating (1-5)
    rating: {
      type: Number,
      min:  1,
      max:  5,
    },

    // Recruiter-assigned sort order within a Kanban column
    kanbanOrder: { type: Number, default: 0 },

    // ── Interview details ─────────────────────────────────────────────────────
    interviewDate: { type: Date },
    interviewType: {
      type: String,
      enum: ['online', 'onsite', 'phone', 'technical', 'panel'],
    },
    interviewLink:  { type: String },        // Video call URL
    interviewNotes: { type: String, maxlength: 1000 },

    // ── Offer details ─────────────────────────────────────────────────────────
    offerDetails: offerDetailsSchema,

    // ── AI Analysis Result ────────────────────────────────────────────────────
    aiAnalysis: {
      matchScore:        { type: Number, min: 0, max: 100 },
      confidence:        { type: Number, min: 0, max: 1 },   // Model confidence
      skillsMatched:     [{ type: String }],
      skillsMissing:     [{ type: String }],
      experienceSummary: { type: String },
      strengths:         [{ type: String }],
      weaknesses:        [{ type: String }],
      summary:           { type: String },
      suggestedQuestions:[{ type: String }],
      rawTextSnippet:    { type: String, maxlength: 500 },   // First ~500 chars for preview
      analyzedAt:        { type: Date },
      isAnalyzed:        { type: Boolean, default: false },
      isAnalyzing:       { type: Boolean, default: false },
      error:             { type: String },
    },

    // ── Recruiter notes ───────────────────────────────────────────────────────
    notes: [noteSchema],

    // ── Status history (activity feed) ────────────────────────────────────────
    statusHistory: [statusHistorySchema],

    // ── Withdrawal ────────────────────────────────────────────────────────────
    isWithdrawn:  { type: Boolean, default: false },
    withdrawnAt:  { type: Date },
    withdrawReason:{ type: String, maxlength: 500 },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

applicationSchema.virtual('isAnalyzed').get(function () {
  return !!this.aiAnalysis?.isAnalyzed;
});

applicationSchema.virtual('matchScoreLabel').get(function () {
  const score = this.aiAnalysis?.matchScore;
  if (score == null) return 'Not analyzed';
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
});

applicationSchema.virtual('matchScoreColor').get(function () {
  const score = this.aiAnalysis?.matchScore;
  if (score == null) return 'default';
  if (score >= 80) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'error';
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Kanban / pipeline queries
applicationSchema.index({ job: 1, stage: 1, kanbanOrder: 1 });
applicationSchema.index({ job: 1, status: 1 });

// Applicant's own applications list
applicationSchema.index({ applicant: 1, createdAt: -1 });

// AI ranking queries (sorted by score descending for a job)
applicationSchema.index({ job: 1, 'aiAnalysis.matchScore': -1 });

// Recruiter rating filter
applicationSchema.index({ job: 1, rating: -1 });

// Pending AI analysis batch queries
applicationSchema.index({ 'aiAnalysis.isAnalyzed': 1, 'aiAnalysis.isAnalyzing': 1 });

// ─── Pre-save hooks ───────────────────────────────────────────────────────────

applicationSchema.pre('save', function (next) {
  // Sync stage with status when status changes (coarse sync)
  if (this.isModified('status')) {
    const stageMap = {
      applied:   'new',
      screening: 'reviewed',
      interview: 'interview_scheduled',
      offered:   'offer_extended',
      hired:     'hired',
      rejected:  'rejected',
    };
    if (stageMap[this.status]) {
      this.stage = stageMap[this.status];
    }
  }

  // Record withdrawal timestamp
  if (this.isModified('isWithdrawn') && this.isWithdrawn && !this.withdrawnAt) {
    this.withdrawnAt = new Date();
  }

  next();
});

// ─── Static methods ───────────────────────────────────────────────────────────

/** Get Kanban board data for a job — grouped by stage. */
applicationSchema.statics.getKanbanBoard = async function (jobId) {
  const stages = ['new', 'reviewed', 'shortlisted', 'interview_scheduled', 'offer_extended', 'hired', 'rejected'];
  const applications = await this.find({ job: jobId, isWithdrawn: false })
    .populate('applicant', 'name email avatar skills location')
    .sort({ stage: 1, kanbanOrder: 1, 'aiAnalysis.matchScore': -1 });

  const board = {};
  stages.forEach((s) => { board[s] = []; });
  applications.forEach((app) => {
    if (board[app.stage]) board[app.stage].push(app);
  });
  return board;
};

/** Get ranked candidates for a job sorted by AI match score. */
applicationSchema.statics.getRankedCandidates = function (jobId, minScore = 0) {
  return this.find({
    job: jobId,
    isWithdrawn: false,
    'aiAnalysis.isAnalyzed': true,
    'aiAnalysis.matchScore': { $gte: minScore },
  })
    .populate('applicant', 'name email avatar skills location linkedIn')
    .sort({ 'aiAnalysis.matchScore': -1, rating: -1 });
};

module.exports = mongoose.model('Application', applicationSchema);
