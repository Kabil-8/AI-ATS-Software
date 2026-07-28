const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: { type: String, trim: true },
    summary: { type: String, trim: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    links: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      portfolio: { type: String, trim: true },
    },
    experienceYears: { type: Number, default: 0 },
    noticePeriodDays: { type: Number, default: 30 },
    expectedSalary: { type: Number, default: 0 },
    currentSalary: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    
    technicalSkills: [{ type: String, trim: true }],
    softSkills: [{ type: String, trim: true }],
    
    education: [
      {
        degree: { type: String },
        fieldOfStudy: { type: String },
        institution: { type: String },
        startYear: { type: Number },
        endYear: { type: Number },
        grade: { type: String },
      },
    ],
    experience: [
      {
        title: { type: String },
        company: { type: String },
        location: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        isCurrent: { type: Boolean, default: false },
        description: { type: String },
        technologiesUsed: [{ type: String }],
      },
    ],
    projects: [
      {
        title: { type: String },
        description: { type: String },
        link: { type: String },
        technologies: [{ type: String }],
      },
    ],
    certifications: [
      {
        name: { type: String },
        issuingOrganization: { type: String },
        issueDate: { type: Date },
        credentialUrl: { type: String },
      },
    ],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    resumeUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
