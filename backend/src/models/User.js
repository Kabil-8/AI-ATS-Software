const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['super_admin', 'company_admin', 'recruiter', 'interviewer', 'candidate', 'applicant'],
      default: 'candidate',
      required: [true, 'Role is required'],
    },
    // Company & Organization Linkage
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    companyName: { type: String, trim: true },
    department: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
    permissions: [{ type: String }],
    
    // Profile Details
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    avatar: { type: String },
    
    // Auth & Security Features
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    otpCode: { type: String },
    otpExpires: { type: Date },
    
    // 2FA Authentication
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    
    // Social Login Provider Identifiers
    googleId: { type: String },
    githubId: { type: String },
    
    // Refresh Token Management
    refreshToken: { type: String, select: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Pre-save password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Clean sensitive values from API responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.twoFactorSecret;
  delete obj.resetPasswordToken;
  delete obj.verificationToken;
  delete obj.otpCode;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
