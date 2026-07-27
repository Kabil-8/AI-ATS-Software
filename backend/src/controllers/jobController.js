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
    const { status, page = 1, limit = 10, search, sort = '-createdAt' } = req.query;
    const filter = { postedBy: req.user._id };
    if (status && status !== 'all') filter.status = status;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Job.countDocuments(filter),
    ]);

    // Append avg AI match score for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const [allApps, analyzedApps] = await Promise.all([
          Application.countDocuments({ job: job._id }),
          Application.find({ job: job._id, 'aiAnalysis.isAnalyzed': true }).select('aiAnalysis.matchScore'),
        ]);
        const avgScore = analyzedApps.length
          ? Math.round(analyzedApps.reduce((sum, a) => sum + (a.aiAnalysis.matchScore || 0), 0) / analyzedApps.length)
          : null;
        return { ...job.toJSON(), avgMatchScore: avgScore, applicationCount: allApps };
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
    const myJobIds = await Job.find({ postedBy: req.user._id }).distinct('_id');

    const [openJobs, draftJobs, totalApplications, avgScoreResult, recentActivity] = await Promise.all([
      Job.countDocuments({ postedBy: req.user._id, status: 'active' }),
      Job.countDocuments({ postedBy: req.user._id, status: 'draft' }),
      Application.countDocuments({ job: { $in: myJobIds } }),
      Application.aggregate([
        {
          $match: {
            job: { $in: myJobIds },
            'aiAnalysis.isAnalyzed': true,
          },
        },
        { $group: { _id: null, avgScore: { $avg: '$aiAnalysis.matchScore' } } },
      ]),
      Application.find({ job: { $in: myJobIds } })
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
        draftJobs,
        totalApplications,
        avgMatchScore: avgScoreResult[0] ? Math.round(avgScoreResult[0].avgScore) : 0,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @PATCH /api/jobs/:id/publish — Recruiter: toggle draft ↔ active
exports.publishJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });

    if (['archived', 'closed'].includes(job.status)) {
      return res.status(400).json({ success: false, message: 'Cannot publish an archived or closed job' });
    }

    job.status = job.status === 'active' ? 'draft' : 'active';
    if (job.status === 'active' && !job.publishedAt) {
      job.publishedAt = new Date();
    }
    await job.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: job.status === 'active' ? 'Job published successfully' : 'Job moved back to draft',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @PATCH /api/jobs/:id/close — Recruiter: close job (stops new applications)
exports.closeJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id, status: { $in: ['active', 'draft'] } },
      { status: 'closed' },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found, unauthorized, or already closed/archived' });

    res.json({ success: true, message: 'Job closed successfully', data: job });
  } catch (error) {
    next(error);
  }
};

// @POST /api/jobs/:id/duplicate — Recruiter: clone a job as a new draft
exports.duplicateJob = async (req, res, next) => {
  try {
    const source = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!source) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });

    // Build a copy without lifecycle fields
    const { _id, createdAt, updatedAt, publishedAt, views, applicationCount, __v, ...jobData } = source.toObject();

    const duplicate = await Job.create({
      ...jobData,
      title: `${source.title} (Copy)`,
      status: 'draft',
      views: 0,
      applicationCount: 0,
      publishedAt: null,
      applicationDeadline: null,
      postedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Job duplicated as draft', data: duplicate });
  } catch (error) {
    next(error);
  }
};

// @GET /api/jobs/recruiter/analytics — Per-job analytics for recruiter dashboard
exports.getJobAnalytics = async (req, res, next) => {
  try {
    const myJobs = await Job.find({ postedBy: req.user._id }).select('title status views applicationCount createdAt publishedAt');
    const myJobIds = myJobs.map((j) => j._id);

    // Funnel counts across all jobs
    const [stageCounts, topJobs, trend30d] = await Promise.all([
      Application.aggregate([
        { $match: { job: { $in: myJobIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: { job: { $in: myJobIds } } },
        { $group: { _id: '$job', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'jobInfo' } },
        { $unwind: '$jobInfo' },
        { $project: { title: '$jobInfo.title', count: 1, status: '$jobInfo.status' } },
      ]),
      Application.aggregate([
        {
          $match: {
            job: { $in: myJobIds },
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Map funnel stages to ordered pipeline steps
    const STAGE_ORDER = ['applied', 'screening', 'interview', 'offered', 'hired'];
    const stageMap = Object.fromEntries(stageCounts.map((s) => [s._id, s.count]));
    const funnel = STAGE_ORDER.map((stage) => ({ stage, count: stageMap[stage] || 0 }));

    // Per-job stats for bar chart
    const jobStats = myJobs.map((j) => ({
      _id: j._id,
      title: j.title.length > 20 ? j.title.slice(0, 20) + '…' : j.title,
      status: j.status,
      views: j.views,
      applications: j.applicationCount,
      conversionRate:
        j.views > 0 ? Math.round((j.applicationCount / j.views) * 100) : 0,
    }));

    res.json({
      success: true,
      data: {
        funnel,
        jobStats,
        topJobs,
        trend30d,
        totals: {
          views: myJobs.reduce((s, j) => s + j.views, 0),
          applications: myJobs.reduce((s, j) => s + j.applicationCount, 0),
          activeJobs: myJobs.filter((j) => j.status === 'active').length,
          draftJobs: myJobs.filter((j) => j.status === 'draft').length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @POST /api/jobs/recruiter/bulk-action — Bulk status update
exports.bulkAction = async (req, res, next) => {
  try {
    const { jobIds, action } = req.body;
    if (!Array.isArray(jobIds) || !jobIds.length) {
      return res.status(400).json({ success: false, message: 'jobIds array is required' });
    }
    const validActions = { archive: 'archived', publish: 'active', close: 'closed', draft: 'draft' };
    if (!validActions[action]) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    const result = await Job.updateMany(
      { _id: { $in: jobIds }, postedBy: req.user._id },
      { status: validActions[action] }
    );
    res.json({ success: true, message: `${result.modifiedCount} jobs updated`, modifiedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};
