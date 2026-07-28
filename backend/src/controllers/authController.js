const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const Company = require('../models/Company');
const CandidateProfile = require('../models/CandidateProfile');
const { logActivity } = require('../middleware/auth');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, company: user.company },
    process.env.JWT_SECRET || 'talentai_secret_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'talentai_refresh_secret_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register User
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, companyName, phone, department, jobTitle } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    let companyId = null;
    if (role === 'company_admin' || (role === 'recruiter' && companyName)) {
      let company = await Company.findOne({ name: companyName });
      if (!company && companyName) {
        company = await Company.create({ name: companyName, departments: department ? [department] : [] });
      }
      if (company) companyId = company._id;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'candidate',
      company: companyId,
      companyName,
      phone,
      department,
      jobTitle,
      isEmailVerified: true, // Auto verify for demo/dev
    });

    if (user.role === 'candidate' || user.role === 'applicant') {
      await CandidateProfile.create({
        user: user._id,
        phone,
      });
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    await logActivity(req, 'REGISTER', 'User', user._id, `Registered as ${user.role}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      accessToken: token,
      refreshToken,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login User
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +twoFactorSecret');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          success: true,
          requireTwoFactor: true,
          message: 'Two-factor authentication code required',
        });
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
      });
      if (!verified) {
        return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
      }
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      accessToken: token,
      refreshToken,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('company');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = ['name', 'phone', 'location', 'linkedIn', 'github', 'portfolio', 'avatar', 'jobTitle', 'department'];
    const updateData = {};
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
    
    // Also update candidate profile if role is candidate
    if (user.role === 'candidate' || user.role === 'applicant') {
      await CandidateProfile.findOneAndUpdate(
        { user: user._id },
        { phone: user.phone, location: user.location, 'links.linkedin': user.linkedIn, 'links.github': user.github, 'links.portfolio': user.portfolio },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Setup 2FA (Returns QR Code URL & Secret)
// @route   POST /api/auth/2fa/setup
exports.setupTwoFactor = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `TalentAI ATS (${req.user.email})` });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.status(200).json({
      success: true,
      secret: secret.base32,
      qrCodeUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify and Enable 2FA
// @route   POST /api/auth/2fa/verify
exports.verifyTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id).select('+twoFactorSecret');

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA verification token' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({ success: true, message: 'Two-factor authentication enabled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'talentai_refresh_secret_2026');
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    res.status(200).json({ success: true, accessToken: newAccessToken, refreshToken: user.refreshToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Expired or invalid refresh token' });
  }
};

// @desc    Forgot Password OTP request
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset OTP generated',
      demoOtp: otp, // For testing & easy preview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    // In a real app, you might invalidate the token in a blacklist here.
    // For now, simply return success.
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase(),
      otpCode: otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
