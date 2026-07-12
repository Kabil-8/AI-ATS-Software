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
      minlength: [50, 'Description must be at least 50 characters'],
    },
    requirements: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true, lowercase: true }],
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    location: { type: String, trim: true, default: 'Remote' },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'remote', 'internship'],
      required: [true, 'Job type is required'],
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'manager'],
      required: true,
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' },
      isVisible: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived', 'closed'],
      default: 'active',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    closingDate: { type: Date },
  },
  { timestamps: true }
);

// Text search index
jobSchema.index({ title: 'text', description: 'text', skills: 'text', department: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
