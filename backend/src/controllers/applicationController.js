const Application = require('../models/Application');
const Job = require('../models/Job');
const emailService = require('../services/emailService');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, BUCKET_NAME } = require('../config/s3');

// @POST /api/applications — Applicant submits application
exports.createApplication = async (req, res, next) => {
  try {
    const { jobId, coverLetter, linkedIn, portfolio } = req.body;

    const job = await Job.findOne({ _id: jobId, status: 'active' });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or no longer active' });

    // Check for duplicate
    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already applied to this job' });
    }

    const applicationData = {
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      linkedIn,
      portfolio,
      statusHistory: [{ from: null, to: 'applied', changedBy: req.user._id }],
    };

    // Handle file upload
    if (req.file) {
      applicationData.resumeKey = req.file.key || `resumes/${req.file.originalname}`;
      applicationData.resumeUrl = req.file.location || '';
      applicationData.resumeFileName = req.file.originalname;
    }

    const application = await Application.create(applicationData);

    // Increment job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // Populate for response
    const populated = await Application.findById(application._id)
      .populate('applicant', 'name email')
      .populate('job', 'title company');

    // Send confirmation email
    await emailService.sendApplicationConfirmation(req.user, job);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/applications/my — Applicant's own applications
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title department location type salary status')
      .sort('-createdAt');

    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

// @GET /api/applications/job/:jobId — Recruiter: all applications for a job (Kanban/Ranking)
exports.getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user._id });
    if (!job) return res.status(403).json({ success: false, message: 'Access denied' });

    const {
      status, minScore, maxScore, skills,
      sortBy = '-aiAnalysis.matchScore',
    } = req.query;

    const filter = { job: req.params.jobId };
    if (status) filter.status = status;
    if (minScore || maxScore) {
      filter['aiAnalysis.matchScore'] = {};
      if (minScore) filter['aiAnalysis.matchScore'].$gte = Number(minScore);
      if (maxScore) filter['aiAnalysis.matchScore'].$lte = Number(maxScore);
    }

    let applications = await Application.find(filter)
      .populate('applicant', 'name email phone location')
      .sort(sortBy);

    // Filter by skills (post-query)
    if (skills) {
      const skillArr = skills.split(',').map((s) => s.trim().toLowerCase());
      applications = applications.filter((app) =>
        skillArr.every((skill) =>
          app.aiAnalysis?.skillsMatched?.some((s) => s.toLowerCase().includes(skill))
        )
      );
    }

    // Generate presigned resume URLs
    const appsWithUrls = await Promise.all(
      applications.map(async (app) => {
        const obj = app.toJSON();
        if (app.resumeKey && BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key_id') {
          try {
            const cmd = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: app.resumeKey });
            obj.resumeSignedUrl = await getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
          } catch (_) {}
        }
        return obj;
      })
    );

    res.json({ success: true, data: appsWithUrls });
  } catch (error) {
    next(error);
  }
};

// @GET /api/applications/:id — Single application
exports.getApplication = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone location linkedIn portfolio')
      .populate('job', 'title description requirements skills department');

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    // Ownership check
    const isOwner = app.applicant._id.toString() === req.user._id.toString();
    const isRecruiter = req.user.role === 'recruiter';

    if (!isOwner && !isRecruiter) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: app });
  } catch (error) {
    next(error);
  }
};

// @PATCH /api/applications/:id/status — Recruiter: update pipeline status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const VALID_STATUSES = ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const app = await Application.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('job', 'title');

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    const oldStatus = app.status;
    app.status = status;
    app.statusHistory.push({ from: oldStatus, to: status, changedBy: req.user._id, note });
    await app.save();

    // Send email notification
    await emailService.sendStatusUpdate(app.applicant, app.job, status, note);

    res.json({ success: true, data: app, message: `Status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

// @POST /api/applications/:id/notes — Recruiter: add note
exports.addNote = async (req, res, next) => {
  try {
    const { content } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { content, addedBy: req.user._id } } },
      { new: true }
    ).populate('notes.addedBy', 'name');

    res.json({ success: true, data: app });
  } catch (error) {
    next(error);
  }
};

// @PATCH /api/applications/:id/stage — Recruiter: move Kanban stage
exports.updateStage = async (req, res, next) => {
  try {
    const VALID_STAGES = ['new', 'reviewed', 'shortlisted', 'interview_scheduled', 'offer_extended', 'hired', 'rejected'];
    const { stage } = req.body;
    if (!VALID_STAGES.includes(stage)) {
      return res.status(400).json({ success: false, message: 'Invalid stage' });
    }

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { stage },
      { new: true, runValidators: true }
    ).populate('applicant', 'name email avatar').populate('job', 'title');

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    res.json({ success: true, data: app, message: `Stage updated to ${stage}` });
  } catch (error) {
    next(error);
  }
};

// @PATCH /api/applications/:id/rating — Recruiter: set star rating (1-5)
exports.updateRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    if (rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { rating: Number(rating) },
      { new: true }
    );

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    res.json({ success: true, data: app, message: `Rating set to ${rating}` });
  } catch (error) {
    next(error);
  }
};

// @PATCH /api/applications/:id/kanban-order — Recruiter: persist drag-drop order
exports.updateKanbanOrder = async (req, res, next) => {
  try {
    const { kanbanOrder } = req.body;
    if (kanbanOrder === undefined || typeof kanbanOrder !== 'number') {
      return res.status(400).json({ success: false, message: 'kanbanOrder must be a number' });
    }

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { kanbanOrder },
      { new: true }
    );

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    res.json({ success: true, data: app });
  } catch (error) {
    next(error);
  }
};

// @PATCH /api/applications/:id/withdraw — Applicant: self-withdraw application
exports.withdrawApplication = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const app = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id,
    });

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    if (app.isWithdrawn) {
      return res.status(409).json({ success: false, message: 'Application already withdrawn' });
    }

    if (['hired', 'rejected'].includes(app.status)) {
      return res.status(400).json({ success: false, message: 'Cannot withdraw a finalised application' });
    }

    app.isWithdrawn = true;
    app.withdrawReason = reason || '';
    app.statusHistory.push({ from: app.status, to: 'withdrawn', changedBy: req.user._id, note: reason || 'Applicant withdrew' });
    await app.save();

    res.json({ success: true, message: 'Application withdrawn successfully', data: app });
  } catch (error) {
    next(error);
  }
};
