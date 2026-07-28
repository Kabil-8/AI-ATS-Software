const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    fileType: { type: String },
    parsedText: { type: String },
    
    // Extracted Fields from AI Microservice
    extractedSkills: {
      technical: [{ type: String }],
      soft: [{ type: String }],
    },
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        year: { type: String },
      },
    ],
    experience: [
      {
        title: { type: String },
        company: { type: String },
        duration: { type: String },
        summary: { type: String },
      },
    ],
    projects: [{ type: String }],
    certifications: [{ type: String }],
    yearsOfExperience: { type: Number, default: 0 },
    summary: { type: String },
    
    // Quality & ATS Scoring
    atsScore: { type: Number, default: 75 },
    qualityScore: { type: Number, default: 80 },
    fakeProbability: { type: Number, default: 0 },
    isDuplicate: { type: Boolean, default: false },
    embeddings: [{ type: Number }], // Dense vector embeddings array
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
