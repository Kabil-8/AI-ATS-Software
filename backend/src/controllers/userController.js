const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// ─── @GET /api/users/profile — Get own full profile ─────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── @PATCH /api/users/profile — Update own profile (applicant or recruiter) ─
exports.updateProfile = async (req, res, next) => {
  try {
    // Fields safe for both roles
    const sharedFields = [
      'name', 'phone', 'location', 'bio', 'linkedIn', 'portfolio', 'avatar',
    ];

    // Recruiter-specific
    const recruiterFields = [
      'company', 'jobTitle', 'industry', 'companySize',
      'companyWebsite', 'companyDescription', 'companyLogo',
    ];

    // Applicant-specific
    const applicantFields = [
      'skills', 'experience', 'education',
      'preferredJobTypes', 'expectedSalary', 'openToRelocation', 'noticePeriodDays',
    ];

    const allowedFields =
      req.user.role === 'recruiter'
        ? [...sharedFields, ...recruiterFields]
        : [...sharedFields, ...applicantFields];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/users/dashboard — Applicant dashboard stats ──────────────────
exports.getApplicantDashboard = async (req, res, next) => {
  try {
    if (req.user.role !== 'applicant') {
      return res.status(403).json({ success: false, message: 'Applicant access only' });
    }

    const [applications, savedJobs] = await Promise.all([
      Application.find({ applicant: req.user._id })
        .populate('job', 'title company department location type salary status')
        .sort('-createdAt'),
      Job.find({ _id: { $in: req.user.savedJobs || [] }, status: 'active' })
        .select('title company department location type salary status applicationDeadline'),
    ]);

    // Status breakdown
    const statusBreakdown = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    // AI scores
    const analyzed = applications.filter((a) => a.aiAnalysis?.isAnalyzed);
    const avgMatchScore = analyzed.length
      ? Math.round(analyzed.reduce((s, a) => s + (a.aiAnalysis.matchScore || 0), 0) / analyzed.length)
      : null;

    // Recent 5 applications
    const recentApplications = applications.slice(0, 5);

    res.json({
      success: true,
      data: {
        stats: {
          totalApplications: applications.length,
          savedJobs: savedJobs.length,
          avgMatchScore,
          statusBreakdown,
          analyzed: analyzed.length,
        },
        recentApplications,
        savedJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/users/save-job/:jobId — Bookmark a job ──────────────────────
exports.saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const user = await User.findById(req.user._id);

    // Prevent duplicates
    const alreadySaved = user.savedJobs?.some((id) => id.toString() === jobId);
    if (alreadySaved) {
      return res.status(409).json({ success: false, message: 'Job already saved' });
    }

    user.savedJobs = [...(user.savedJobs || []), jobId];
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Job saved successfully', savedJobs: user.savedJobs });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/users/save-job/:jobId — Remove saved job ──────────────────
exports.unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedJobs: jobId },
    });

    res.json({ success: true, message: 'Job removed from saved list' });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/users/saved-jobs — Get all bookmarked jobs ───────────────────
exports.getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('savedJobs');
    const jobs = await Job.find({
      _id: { $in: user.savedJobs || [] },
    }).select('title company department location type salary status applicationDeadline isFeatured createdAt');

    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/users/:id/public — Public profile of an applicant ────────────
exports.getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: 'applicant',
      isActive: true,
    }).select('name avatar bio skills experience education location linkedIn portfolio');

    if (!user) return res.status(404).json({ success: false, message: 'Applicant not found' });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/users/candidates — Recruiter: search candidates ──────────────
exports.searchCandidates = async (req, res, next) => {
  try {
    const { skills, location, search, page = 1, limit = 12 } = req.query;

    const filter = { role: 'applicant', isActive: true };

    if (skills) {
      const skillArr = skills.split(',').map((s) => s.trim().toLowerCase());
      filter.skills = { $in: skillArr };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [candidates, total] = await Promise.all([
      User.find(filter)
        .select('name avatar bio skills experience education location linkedIn')
        .sort('-lastActiveAt')
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: candidates,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};
