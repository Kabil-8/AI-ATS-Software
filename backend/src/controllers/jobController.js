const Job = require('../models/Job');
const Application = require('../models/Application');

// @GET /api/jobs — Public: list all active jobs with filters
exports.getJobs = async (req, res, next) => {
  try {
    const {
      search, department, type, location, experienceLevel,
      page = 1, limit = 12, sort = '-createdAt',
    } = req.query;

    const filter = { status: 'active' };

    if (search) {
      filter.$text = { $search: search };
    }
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (experienceLevel) filter.experienceLevel = experienceLevel;

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'name company')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/jobs/:id — Public: single job
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name company');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Increment view count
    job.views += 1;
    await job.save({ validateBeforeSave: false });

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// @POST /api/jobs — Recruiter: create job
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ success: true, data: job, message: 'Job posted successfully' });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/jobs/:id — Recruiter: update job
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @DELETE /api/jobs/:id — Recruiter: archive job
exports.archiveJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      { status: 'archived' },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    res.json({ success: true, message: 'Job archived successfully' });
  } catch (error) {
    next(error);
  }
};

// @GET /api/jobs/recruiter/my-jobs — Recruiter's own jobs
exports.getMyJobs = async (req, res, next) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query;
    const filter = { postedBy: req.user._id };
    if (status !== 'all') filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      Job.countDocuments(filter),
    ]);

    // Append avg AI match score for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applications = await Application.find({ job: job._id, 'aiAnalysis.isAnalyzed': true });
        const avgScore = applications.length
          ? Math.round(applications.reduce((sum, a) => sum + (a.aiAnalysis.matchScore || 0), 0) / applications.length)
          : null;
        return { ...job.toJSON(), avgMatchScore: avgScore, applicationCount: applications.length };
      })
    );

    res.json({
      success: true,
      data: jobsWithStats,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/jobs/stats — Recruiter stats for dashboard
exports.getRecruiterStats = async (req, res, next) => {
  try {
    const [openJobs, totalApplications, avgScoreResult, recentActivity] = await Promise.all([
      Job.countDocuments({ postedBy: req.user._id, status: 'active' }),
      Application.countDocuments({
        job: { $in: await Job.find({ postedBy: req.user._id }).distinct('_id') },
      }),
      Application.aggregate([
        {
          $match: {
            job: { $in: await Job.find({ postedBy: req.user._id }).distinct('_id') },
            'aiAnalysis.isAnalyzed': true,
          },
        },
        { $group: { _id: null, avgScore: { $avg: '$aiAnalysis.matchScore' } } },
      ]),
      Application.find({
        job: { $in: await Job.find({ postedBy: req.user._id }).distinct('_id') },
      })
        .populate('applicant', 'name')
        .populate('job', 'title')
        .sort('-updatedAt')
        .limit(10)
        .select('status updatedAt applicant job aiAnalysis.matchScore'),
    ]);

    res.json({
      success: true,
      data: {
        openJobs,
        totalApplications,
        avgMatchScore: avgScoreResult[0] ? Math.round(avgScoreResult[0].avgScore) : 0,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
