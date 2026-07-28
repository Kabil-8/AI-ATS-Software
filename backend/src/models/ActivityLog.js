const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: { type: String },
    userRole: { type: String },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    action: {
      type: String,
      required: true,
    },
    entity: {
      type: String,
      enum: ['User', 'Job', 'Application', 'Interview', 'Resume', 'Company', 'System'],
      required: true,
    },
    entityId: { type: String },
    details: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

activityLogSchema.index({ company: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
