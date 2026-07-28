const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    logo: { type: String },
    website: { type: String, trim: true },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      default: '11-50',
    },
    industry: { type: String, trim: true, default: 'Technology' },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },
    subscriptionPlan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'professional',
    },
    departments: [{ type: String, trim: true }],
    aiCreditsLimit: { type: Number, default: 10000 },
    aiCreditsUsed: { type: Number, default: 0 },
    isSuspended: { type: Boolean, default: false },
    suspendedAt: { type: Date },
    suspensionReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
