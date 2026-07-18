const mongoose = require('mongoose');

// ─── Job Schema ───────────────────────────────────────────────────────────────

const jobSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    title: {
      type:      String,
      required:  [true, 'Job title is required'],
      trim:      true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type:      String,
      required:  [true, 'Job description is required'],
      minlength: [50, 'Description must be at least 50 characters'],
    },
    requirements: [{ type: String, trim: true }],
    responsibilities: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true, lowercase: true }],
    tags:   [{ type: String, trim: true, lowercase: true }],

    // ── Classification ────────────────────────────────────────────────────────
    department: {
      type:     String,
      required: [true, 'Department is required'],
      trim:     true,
    },
    location: { type: String, trim: true, default: 'Remote' },
    isRemote: { type: Boolean, default: false },
    type: {
      type:     String,
      enum:     ['full-time', 'part-time', 'contract', 'remote', 'internship'],
      required: [true, 'Job type is required'],
    },
    experienceLevel: {
      type:     String,
      enum:     ['entry', 'mid', 'senior', 'lead', 'manager'],
      required: true,
    },

    // ── Compensation ──────────────────────────────────────────────────────────
    salary: {
      min:       { type: Number, min: 0 },
      max:       { type: Number, min: 0 },
      currency:  { type: String, default: 'USD' },
      isVisible: { type: Boolean, default: true },
      period:    { type: String, enum: ['hourly', 'monthly', 'annual'], default: 'annual' },
    },
    benefits: [{ type: String, trim: true }],

    // ── Company snapshot ──────────────────────────────────────────────────────
    // Denormalized at create time so job listings don't require a User join
    company:     { type: String, trim: true },
    companyLogo: { type: String },
    industry:    { type: String, trim: true },

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['draft', 'active', 'archived', 'closed'],
      default: 'draft',
    },
    applicationDeadline: {
      type:     Date,
      validate: {
        validator: function (v) {
          // Only enforce for new docs or when deadline is being changed
          if (!v) return true;
          return v > new Date();
        },
        message: 'Application deadline must be in the future',
      },
    },
    publishedAt: { type: Date },

    // ── Ownership ─────────────────────────────────────────────────────────────
    postedBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // ── Metrics ───────────────────────────────────────────────────────────────
    applicationCount: { type: Number, default: 0, min: 0 },
    views:            { type: Number, default: 0, min: 0 },
    isFeatured:       { type: Boolean, default: false },

    // ── AI hints ─────────────────────────────────────────────────────────────
    // Minimum AI match score to auto-advance applicants to screening
    autoScreenThreshold: { type: Number, min: 0, max: 100, default: null },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

jobSchema.virtual('isExpired').get(function () {
  if (!this.applicationDeadline) return false;
  return this.applicationDeadline < new Date();
});

jobSchema.virtual('daysRemaining').get(function () {
  if (!this.applicationDeadline) return null;
  const diff = this.applicationDeadline.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

jobSchema.virtual('salaryRange').get(function () {
  if (!this.salary?.min && !this.salary?.max) return null;
  const cur = this.salary.currency || 'USD';
  if (this.salary.min && this.salary.max) {
    return `${cur} ${this.salary.min.toLocaleString()} – ${this.salary.max.toLocaleString()}`;
  }
  return `${cur} ${(this.salary.min || this.salary.max).toLocaleString()}+`;
});

// ─── Pre-save hooks ───────────────────────────────────────────────────────────

// Auto-close when deadline passes
jobSchema.pre('save', function (next) {
  if (this.applicationDeadline && this.applicationDeadline < new Date() && this.status === 'active') {
    this.status = 'closed';
  }
  // Record when first published
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Full-text search on key fields
jobSchema.index({ title: 'text', description: 'text', skills: 'text', department: 'text', tags: 'text' });

// Common query patterns
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ postedBy: 1, status: 1 });
jobSchema.index({ department: 1, status: 1 });
jobSchema.index({ experienceLevel: 1, status: 1 });
jobSchema.index({ skills: 1 });                      // For AI skill-matching
jobSchema.index({ applicationDeadline: 1 });         // For expiry jobs
jobSchema.index({ isFeatured: 1, status: 1, createdAt: -1 });

// ─── Static methods ───────────────────────────────────────────────────────────

/** Find active jobs that match a skill set (for candidate recommendations). */
jobSchema.statics.findBySkills = function (skills, limit = 10) {
  return this.find({
    status: 'active',
    skills: { $in: skills.map((s) => s.toLowerCase()) },
  })
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(limit)
    .select('title company department location type experienceLevel salary skills createdAt');
};

module.exports = mongoose.model('Job', jobSchema);
