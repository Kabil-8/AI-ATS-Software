const Application = require('../models/Application');
const Job = require('../models/Job');
const aiService = require('../services/aiService');

// @POST /api/ai/analyze/:applicationId — Trigger AI analysis
exports.analyzeApplication = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.applicationId)
      .populate('job', 'title description requirements skills')
      .populate('applicant', 'name');

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    // Verify recruiter owns the job
    const job = await Job.findOne({ _id: app.job._id, postedBy: req.user._id });
    if (!job) return res.status(403).json({ success: false, message: 'Access denied' });

    if (app.aiAnalysis?.isAnalyzing) {
      return res.status(409).json({ success: false, message: 'Analysis already in progress' });
    }

    // Mark as analyzing
    app.aiAnalysis = { ...app.aiAnalysis, isAnalyzing: true, error: null };
    await app.save();

    // Respond immediately, process async
    res.json({ success: true, message: 'AI analysis started', applicationId: app._id });

    // Run analysis in background
    try {
      const result = await aiService.analyzeResume({
        resumeKey: app.resumeKey,
        resumeUrl: app.resumeUrl,
        jobTitle: app.job.title,
        jobDescription: app.job.description,
        jobRequirements: app.job.requirements,
        jobSkills: app.job.skills,
      });

      app.aiAnalysis = {
        ...result,
        isAnalyzed: true,
        isAnalyzing: false,
        analyzedAt: new Date(),
      };
      await app.save();
    } catch (aiError) {
      app.aiAnalysis = {
        isAnalyzing: false,
        isAnalyzed: false,
        error: aiError.message,
      };
      await app.save();
    }
  } catch (error) {
    next(error);
  }
};

// @POST /api/ai/analyze-batch/:jobId — Analyze all applications for a job
exports.analyzeBatch = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user._id });
    if (!job) return res.status(403).json({ success: false, message: 'Access denied' });

    const applications = await Application.find({
      job: req.params.jobId,
      'aiAnalysis.isAnalyzed': false,
      'aiAnalysis.isAnalyzing': { $ne: true },
    });

    if (!applications.length) {
      return res.json({ success: true, message: 'No pending applications to analyze', count: 0 });
    }

    res.json({ success: true, message: `Started analysis for ${applications.length} applications`, count: applications.length });

    // Process sequentially to avoid rate limits
    for (const app of applications) {
      try {
        app.aiAnalysis = { isAnalyzing: true };
        await app.save();

        const result = await aiService.analyzeResume({
          resumeKey: app.resumeKey,
          resumeUrl: app.resumeUrl,
          jobTitle: job.title,
          jobDescription: job.description,
          jobRequirements: job.requirements,
          jobSkills: job.skills,
        });

        app.aiAnalysis = { ...result, isAnalyzed: true, isAnalyzing: false, analyzedAt: new Date() };
        await app.save();
      } catch (err) {
        app.aiAnalysis = { isAnalyzing: false, error: err.message };
        await app.save();
      }
    }
  } catch (error) {
    next(error);
  }
};

// @GET /api/ai/status/:applicationId — Get analysis status
exports.getAnalysisStatus = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.applicationId).select('aiAnalysis');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: app.aiAnalysis });
  } catch (error) {
    next(error);
  }
};
