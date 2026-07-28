const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interviewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, default: 'Technical Interview' },
    round: {
      type: String,
      enum: ['Screening', 'Technical Round 1', 'Technical Round 2', 'System Design', 'HR Round', 'Executive Round'],
      default: 'Technical Round 1',
    },
    scheduledDate: { type: Date, required: true },
    durationMinutes: { type: Number, default: 45 },
    meetingPlatform: {
      type: String,
      enum: ['Google Meet', 'Zoom', 'Microsoft Teams', 'Custom Link'],
      default: 'Google Meet',
    },
    meetingLink: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    feedback: [
      {
        interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        interviewerName: { type: String },
        rating: { type: Number, min: 1, max: 5, required: true },
        technicalSkillRating: { type: Number, min: 1, max: 5 },
        communicationRating: { type: Number, min: 1, max: 5 },
        problemSolvingRating: { type: Number, min: 1, max: 5 },
        cultureFitRating: { type: Number, min: 1, max: 5 },
        comments: { type: String },
        recommendation: { type: String, enum: ['Strong Hire', 'Hire', 'No Hire', 'Strong No Hire'] },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

interviewSchema.index({ candidate: 1, scheduledDate: 1 });
interviewSchema.index({ interviewers: 1, scheduledDate: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
