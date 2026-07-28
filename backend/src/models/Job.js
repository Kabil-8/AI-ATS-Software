const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: [30, 'Description must be at least 30 characters'],
    },
    responsibilities: [{ type: String, trim: true }],
    requiredSkills: [{ type: String, trim: true, lowercase: true }],
    preferredSkills: [{ type: String, trim: true, lowercase: true }],
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    location: { type: String, trim: true, default: 'Remote' },
    workplaceType: {
      type: String,
      enum: ['remote', 'hybrid', 'on-site'],
      default: 'remote',
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'remote', 'internship'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'manager', 'executive'],
      default: 'mid',
    },
    educationLevel: {
      type: String,
      enum: ["Bachelor's", "Master's", "Ph.D.", "High School", "Any"],
      default: "Bachelor's",
    },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      period: { type: String, enum: ['yearly', 'monthly', 'hourly'], default: 'yearly' },
      isVisible: { type: Boolean, default: true },
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hiringTeam: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['interviewer', 'reviewer', 'hiring_manager'] },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'active', 'archived', 'closed'],
      default: 'active',
    },
    isTemplate: { type: Boolean, default: false },
    templateName: { type: String },
    applicationCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    deadline: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text', department: 'text' });
jobSchema.index({ company: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
