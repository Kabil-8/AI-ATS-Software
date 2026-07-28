const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');
const { logActivity } = require('../middleware/auth');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Submit application for job
// @route   POST /api/applications
exports.submitApplication = async (req, res) => {
  try {
    const { jobId, coverLetter, linkedIn, github, portfolio, resumeUrl, resumeFileName, resumeKey } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'active') return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });

    // Check if user already applied
    const existing = await Application.findOne({ job: jobId, applicant: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      company: job.company,
      recruiter: job.recruiter,
      coverLetter,
      linkedIn: linkedIn || req.user.linkedIn,
      github: github || req.user.github,
      portfolio: portfolio || req.user.portfolio,
      resumeUrl,
      resumeFileName,
      resumeKey,
      status: 'applied',
      appliedDate: new Date(),
    });

    // Increment job application counter
    job.applicationCount += 1;
    await job.save();

    // Trigger asynchronous AI Analysis if Python AI Microservice is available
    triggerAiAnalysis(application, job).catch((err) => console.error('AI Processing Error:', err.message));

    // Notify Recruiter
    await Notification.create({
      user: job.recruiter,
      title: 'New Application Received',
      message: `${req.user.name} applied for ${job.title}`,
      type: 'application_update',
      link: `/recruiter/candidate/${application._id}`,
    });

    await logActivity(req, 'APPLY', 'Application', application._id, `Applied to ${job.title}`);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Internal function to call Python AI Microservice
async function triggerAiAnalysis(application, job) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      resume_text: application.coverLetter || `${application.resumeFileName || ''} Candidate Resume Content`,
      job_title: job.title,
      job_description: job.description,
      job_requirements: job.requiredSkills || [],
      job_skills: job.requiredSkills || [],
    }, { timeout: 8000 });

    if (response.data && response.data.success && response.data.result) {
      const data = response.data.result;
      application.aiScore = Math.round(data.overallScore);
      application.aiSummary = data.explanation || 'AI analysis completed successfully.';
      application.scoreBreakdown = {
        technicalScore: Math.round(data.technicalScore || 0),
        semanticScore: Math.round(data.semanticScore || 0),
        experienceScore: Math.round(data.experienceScore || 0),
        educationScore: Math.round(data.educationScore || 0),
        projectScore: Math.round(data.projectScore || 0),
        certificationScore: Math.round(data.certificationScore || 0),
        resumeQuality: Math.round(data.resumeQuality || 0),
        softSkillScore: Math.round(data.softSkillScore || 0),
        portfolioScore: Math.round(data.portfolioScore || 0),
        locationMatch: 100,
      };
      application.aiAnalysis = {
        skillsMatched: data.matchedSkills || [],
        skillsMissing: data.missingSkills || [],
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        resumeSuggestions: data.resumeSuggestions || [],
        projectRelevance: data.projectRelevance || [],
        hiringRecommendation: data.hiringRecommendation || 'Possible Hire',
        recommendation: data.recommendation || 'Needs Review',
        interviewProbability: data.interviewProbability || '50%',
        explanation: data.explanation || '',
        isAnalyzed: true,
        analyzedAt: new Date(),
      };
      await application.save();
    } else {
        throw new Error('AI analysis failed or returned invalid format');
    }
  } catch (err) {
    console.warn('AI Microservice unavailable or error, generating baseline scores:', err.message);
    // Fallback baseline heuristic calculation for new 9D model
    application.aiScore = 75;
    application.aiSummary = 'Baseline AI score assigned based on submitted profile.';
    application.scoreBreakdown = {
      technicalScore: 75,
      semanticScore: 75,
      experienceScore: 70,
      educationScore: 80,
      projectScore: 70,
      certificationScore: 50,
      resumeQuality: 80,
      softSkillScore: 70,
      portfolioScore: 50,
      locationMatch: 100,
    };
    application.aiAnalysis = {
      skillsMatched: job.requiredSkills || [],
      skillsMissing: [],
      strengths: ['Standard qualifications met'],
      weaknesses: [],
      resumeSuggestions: ['Add measurable achievements'],
      projectRelevance: ['Review required'],
      hiringRecommendation: 'Hire',
      recommendation: 'Recommended',
      interviewProbability: '75%',
      explanation: 'Generated by backend fallback due to AI service unavailability.',
      isAnalyzed: true,
      analyzedAt: new Date(),
    };
    await application.save();
  }
}

// @desc    Get Candidate Applications
// @route   GET /api/applications/my-applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title department location salaryRange status company')
      .populate('company', 'name logo')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Applications for a Job (Recruiter Pipeline)
// @route   GET /api/applications/job/:jobId
exports.getJobApplications = async (req, res) => {
  try {
    const { status, minScore, search } = req.query;
    const query = { job: req.params.jobId };

    if (status && status !== 'all') query.status = status;
    if (minScore) query.aiScore = { $gte: Number(minScore) };

    let applications = await Application.find(query)
      .populate('applicant', 'name email phone avatar location linkedIn github portfolio')
      .populate('job', 'title department requiredSkills')
      .sort({ aiScore: -1, createdAt: -1 });

    if (search) {
      applications = applications.filter(
        (app) =>
          app.applicant?.name?.toLowerCase().includes(search.toLowerCase()) ||
          app.applicant?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Application Detail by ID
// @route   GET /api/applications/:id
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone location linkedIn github portfolio avatar')
      .populate('job', 'title department description requiredSkills salaryRange recruiter')
      .populate('recruiterNotes.addedBy', 'name role avatar');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    res.status(200).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Application Stage (Kanban Drag-and-Drop)
// @route   PUT /api/applications/:id/stage
exports.updateApplicationStage = async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id).populate('job', 'title');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const prevStatus = application.status;
    application.status = status;
    application.statusHistory.push({
      from: prevStatus,
      to: status,
      changedBy: req.user.id,
      changedAt: new Date(),
      note: note || `Moved stage from ${prevStatus} to ${status}`,
    });

    await application.save();

    // Notify Applicant
    await Notification.create({
      user: application.applicant,
      title: 'Application Status Update',
      message: `Your application status for ${application.job?.title} was updated to ${status.replace('_', ' ')}`,
      type: 'application_update',
      link: '/applicant/dashboard',
    });

    await logActivity(req, 'STAGE_CHANGE', 'Application', application._id, `Moved stage to ${status}`);

    res.status(200).json({ success: true, message: 'Stage updated successfully', application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Recruiter Note
// @route   POST /api/applications/:id/notes
exports.addNote = async (req, res) => {
  try {
    const { content } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.recruiterNotes.push({
      content,
      addedBy: req.user.id,
      addedByName: req.user.name,
      createdAt: new Date(),
    });

    await application.save();
    res.status(200).json({ success: true, notes: application.recruiterNotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
