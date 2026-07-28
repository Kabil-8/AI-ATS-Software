const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { logActivity } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// @desc    Schedule an Interview
// @route   POST /api/interviews
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicationId, candidateId, jobId, title, round, scheduledDate, durationMinutes, meetingPlatform, interviewerIds } = req.body;

    const application = await Application.findById(applicationId).populate('applicant', 'name email');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Generate link format based on platform
    let meetingLink = '';
    const roomCode = Math.random().toString(36).substring(2, 10);
    if (meetingPlatform === 'Google Meet') {
      meetingLink = `https://meet.google.com/${roomCode.slice(0, 3)}-${roomCode.slice(3, 6)}-${roomCode.slice(6)}`;
    } else if (meetingPlatform === 'Zoom') {
      meetingLink = `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    } else if (meetingPlatform === 'Microsoft Teams') {
      meetingLink = `https://teams.microsoft.com/l/meetup-join/${roomCode}`;
    } else {
      meetingLink = `https://talentai-meet.com/room/${roomCode}`;
    }

    const interview = await Interview.create({
      application: applicationId,
      job: jobId || application.job,
      candidate: candidateId || application.applicant._id,
      interviewers: interviewerIds && interviewerIds.length ? interviewerIds : [req.user.id],
      scheduledBy: req.user.id,
      title: title || `${round || 'Technical'} Interview`,
      round: round || 'Technical Round 1',
      scheduledDate: new Date(scheduledDate),
      durationMinutes: durationMinutes || 45,
      meetingPlatform: meetingPlatform || 'Google Meet',
      meetingLink,
      status: 'scheduled',
    });

    // Update Application stage to 'interview' or 'technical_round' if requested
    if (application.status === 'applied' || application.status === 'screening') {
      application.status = 'interview';
      await application.save();
    }

    // Send notifications to candidate & interviewers
    await Notification.create({
      user: application.applicant._id,
      title: 'Interview Scheduled!',
      message: `Your ${round} interview is scheduled for ${new Date(scheduledDate).toLocaleString()}`,
      type: 'interview_scheduled',
      link: '/applicant/dashboard',
    });

    // Send email invitation
    try {
      await sendEmail({
        to: application.applicant.email,
        subject: `Interview Scheduled: ${round} at TalentAI`,
        html: `
          <h3>Interview Invitation</h3>
          <p>Hi ${application.applicant.name},</p>
          <p>You have been invited for a <strong>${round}</strong>.</p>
          <p><strong>Date & Time:</strong> ${new Date(scheduledDate).toLocaleString()}</p>
          <p><strong>Platform:</strong> ${meetingPlatform}</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
          <br/><p>Best regards,<br/>TalentAI Recruitment Team</p>
        `,
      });
    } catch (e) {
      console.warn('Email service warning:', e.message);
    }

    await logActivity(req, 'SCHEDULE_INTERVIEW', 'Interview', interview._id, `Scheduled interview for candidate`);

    res.status(201).json({ success: true, message: 'Interview scheduled successfully', interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Interviews for User (Candidate, Recruiter, Interviewer)
// @route   GET /api/interviews
exports.getInterviews = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'candidate' || req.user.role === 'applicant') {
      query.candidate = req.user.id;
    } else if (req.user.role === 'interviewer') {
      query.interviewers = req.user.id;
    } else {
      // Recruiter / Admin - fetch all company interviews or scheduled by them
      query = {};
    }

    const interviews = await Interview.find(query)
      .populate('candidate', 'name email phone avatar')
      .populate('job', 'title department location')
      .populate('interviewers', 'name email avatar jobTitle')
      .sort({ scheduledDate: 1 });

    res.status(200).json({ success: true, count: interviews.length, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Interview Feedback & Ratings
// @route   POST /api/interviews/:id/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, technicalSkillRating, communicationRating, problemSolvingRating, cultureFitRating, comments, recommendation } = req.body;

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    interview.feedback.push({
      interviewer: req.user.id,
      interviewerName: req.user.name,
      rating,
      technicalSkillRating,
      communicationRating,
      problemSolvingRating,
      cultureFitRating,
      comments,
      recommendation,
      submittedAt: new Date(),
    });

    interview.status = 'completed';
    await interview.save();

    // Update Application interview score
    const app = await Application.findById(interview.application);
    if (app) {
      app.interviewScore = rating * 2; // convert 1-5 to 1-10 scale
      await app.save();
    }

    await logActivity(req, 'FEEDBACK_SUBMIT', 'Interview', interview._id, `Submitted feedback: ${recommendation}`);

    res.status(200).json({ success: true, message: 'Feedback submitted successfully', interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
