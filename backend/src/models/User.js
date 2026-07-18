const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Sub-schemas ────────────────────────────────────────────────────────────

const experienceSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    company:     { type: String, required: true, trim: true },
    location:    { type: String, trim: true },
    startDate:   { type: Date, required: true },
    endDate:     { type: Date },
    current:     { type: Boolean, default: false },
    description: { type: String, maxlength: 1000 },
  },
  { _id: true }
);

const educationSchema = new mongoose.Schema(
  {
    degree:      { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    field:       { type: String, trim: true },
    startYear:   { type: Number },
    endYear:     { type: Number },
    grade:       { type: String, trim: true },
  },
  { _id: true }
);

// ─── Main User Schema ────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    // ── Core ──────────────────────────────────────────────────────────────────
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,
    },
    role: {
      type:     String,
      enum:     ['recruiter', 'applicant'],
      required: [true, 'Role is required'],
    },

    // ── Shared profile ────────────────────────────────────────────────────────
    avatar:       { type: String },          // Public URL (S3 or external)
    avatarKey:    { type: String },          // S3 object key for deletion
    bio:          { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
    phone:        { type: String, trim: true },
    location:     { type: String, trim: true },
    linkedIn:     { type: String, trim: true },
    portfolio:    { type: String, trim: true },
    isActive:     { type: Boolean, default: true },
    emailVerified:{ type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },

    // ── Auth tokens ───────────────────────────────────────────────────────────
    refreshToken:       { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires:{ type: Date, select: false },

    // ── Recruiter-specific ────────────────────────────────────────────────────
    company: {
      type: String,
      trim: true,
      required: [
        function () { return this.role === 'recruiter'; },
        'Company name is required for recruiters',
      ],
    },
    jobTitle:           { type: String, trim: true },
    industry:           { type: String, trim: true },
    companySize: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise', ''],
    },
    companyWebsite:     { type: String, trim: true },
    companyDescription: { type: String, maxlength: [1000, 'Company description cannot exceed 1000 characters'] },
    companyLogo:        { type: String },    // URL

    // ── Applicant-specific ────────────────────────────────────────────────────
    skills: [{ type: String, trim: true, lowercase: true }],
    experience: [experienceSchema],
    education:  [educationSchema],

    // Default profile resume (separate from per-application resume)
    resumeKey:      { type: String },        // S3 object key
    resumeUrl:      { type: String },        // Public/presigned URL
    resumeFileName: { type: String },

    // Jobs the applicant has bookmarked
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // Applicant preferences
    preferredJobTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'remote', 'internship'],
    }],
    expectedSalary: {
      min:      { type: Number },
      max:      { type: Number },
      currency: { type: String, default: 'USD' },
    },
    openToRelocation: { type: Boolean, default: false },
    noticePeriodDays: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

userSchema.virtual('initials').get(function () {
  return this.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

userSchema.virtual('isRecruiter').get(function () {
  return this.role === 'recruiter';
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });                      // For candidate search
userSchema.index({ 'experience.company': 'text', skills: 'text', bio: 'text' });

// ─── Pre-save: hash password ──────────────────────────────────────────────────

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Pre-save: update lastActiveAt on login (manual call needed) ──────────────

// ─── Instance Methods ─────────────────────────────────────────────────────────

/** Compare plain password to hashed. */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/** Serialise without sensitive fields. */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

/** Return only public-safe fields (for candidate cards visible to recruiters). */
userSchema.methods.toPublicProfile = function () {
  const { _id, name, avatar, bio, skills, experience, education, location, linkedIn, portfolio } = this.toObject();
  return { _id, name, avatar, bio, skills, experience, education, location, linkedIn, portfolio };
};

// ─── Static Methods ───────────────────────────────────────────────────────────

/** Find applicants whose skills overlap with a given array. */
userSchema.statics.findBySkills = function (skills, limit = 20) {
  return this.find({
    role: 'applicant',
    isActive: true,
    skills: { $in: skills.map((s) => s.toLowerCase()) },
  })
    .select('name email avatar bio skills location')
    .limit(limit);
};

module.exports = mongoose.model('User', userSchema);
