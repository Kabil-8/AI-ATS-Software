const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const { logActivity } = require('../middleware/auth');

// @desc    Get all jobs (Public Job Board + Search/Filter)
// @route   GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const {
      search,
      department,
      location,
      workplaceType,
      employmentType,
      experienceLevel,
      minSalary,
      status = 'active',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (department) query.department = department;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (workplaceType) query.workplaceType = workplaceType;
    if (employmentType) query.employmentType = employmentType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (minSalary) query['salaryRange.max'] = { $gte: Number(minSalary) };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate('recruiter', 'name email avatar')
      .populate('company', 'name logo industry')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Recruiter's jobs
// @route   GET /api/jobs/recruiter/my-jobs
exports.getMyJobs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const jobs = await Job.find({ recruiter: req.user.id })
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Recruiter's stats
// @route   GET /api/jobs/recruiter/stats
exports.getRecruiterStats = async (req, res) => {
  try {
    const activeJobsCount = await Job.countDocuments({ recruiter: req.user.id, status: 'active' });
    const totalJobs = await Job.find({ recruiter: req.user.id });
    const totalApplications = totalJobs.reduce((acc, job) => acc + (job.applicationCount || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        activeJobs: activeJobsCount,
        totalApplications,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name email jobTitle avatar')
      .populate('company', 'name logo website size industry');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Increment view counter
    job.views += 1;
    await job.save();

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new job posting
// @route   POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      recruiter: req.user.id,
      company: req.user.company,
    };

    // Ensure required skills are formatted as lowercase trimmed strings
    if (req.body.requiredSkills && Array.isArray(req.body.requiredSkills)) {
      jobData.requiredSkills = req.body.requiredSkills.map((s) => s.trim().toLowerCase());
    }

    const job = await Job.create(jobData);
    await logActivity(req, 'CREATE', 'Job', job._id, `Created job posting: ${job.title}`);

    res.status(201).json({ success: true, message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update job posting
// @route   PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (req.user.role !== 'super_admin' && job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await logActivity(req, 'UPDATE', 'Job', job._id, `Updated job: ${job.title}`);

    res.status(200).json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Duplicate existing job posting
// @route   POST /api/jobs/:id/duplicate
exports.duplicateJob = async (req, res) => {
  try {
    const original = await Job.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Job not found' });

    const duplicateData = original.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.applicationCount;
    delete duplicateData.views;

    duplicateData.title = `${original.title} (Copy)`;
    duplicateData.status = 'draft';
    duplicateData.recruiter = req.user.id;

    const duplicatedJob = await Job.create(duplicateData);
    res.status(201).json({ success: true, message: 'Job duplicated as draft', job: duplicatedJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete or Archive job
// @route   DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.status = 'archived';
    await job.save();

    await logActivity(req, 'ARCHIVE', 'Job', job._id, `Archived job: ${job.title}`);
    res.status(200).json({ success: true, message: 'Job archived successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bookmark or Save Job for Candidate
// @route   POST /api/jobs/:id/bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ success: false, message: 'Candidate profile not found' });

    const jobId = req.params.id;
    const isBookmarked = profile.savedJobs.includes(jobId);

    if (isBookmarked) {
      profile.savedJobs = profile.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      profile.savedJobs.push(jobId);
    }

    await profile.save();
    res.status(200).json({ success: true, isBookmarked: !isBookmarked, savedJobs: profile.savedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
