const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, getApplicantDashboard,
  saveJob, unsaveJob, getSavedJobs,
  getPublicProfile, searchCandidates,
} = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/auth');

// ── All /api/users routes require authentication ──────────────────────────────

// Own profile
router.get('/profile',        protect, getProfile);
router.patch('/profile',      protect, updateProfile);

// Applicant dashboard & saved jobs
router.get('/dashboard',      protect, requireRole('applicant'), getApplicantDashboard);
router.get('/saved-jobs',     protect, requireRole('applicant'), getSavedJobs);
router.post('/save-job/:jobId',   protect, requireRole('applicant'), saveJob);
router.delete('/save-job/:jobId', protect, requireRole('applicant'), unsaveJob);

// Recruiter: candidate search
router.get('/candidates',     protect, requireRole('recruiter'), searchCandidates);

// Public applicant profile (recruiter-facing)
router.get('/:id/public',    protect, getPublicProfile);

module.exports = router;
