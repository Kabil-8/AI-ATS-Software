const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

// Submit Application
router.post('/', requireRole('candidate', 'applicant'), applicationController.submitApplication);

// My Applications (supported for both /my and /my-applications)
router.get('/my-applications', requireRole('candidate', 'applicant'), applicationController.getMyApplications);
router.get('/my', requireRole('candidate', 'applicant'), applicationController.getMyApplications);

// Recruiter / Interviewer Job Applications
router.get('/job/:jobId', requireRole('recruiter', 'company_admin', 'interviewer'), applicationController.getJobApplications);

// Application Detail
router.get('/:id', applicationController.getApplicationById);

// Stage / Status Updates (supported for /stage and /status with PUT or PATCH)
router.put('/:id/stage', requireRole('recruiter', 'company_admin'), applicationController.updateApplicationStage);
router.patch('/:id/status', requireRole('recruiter', 'company_admin'), applicationController.updateApplicationStage);
router.put('/:id/status', requireRole('recruiter', 'company_admin'), applicationController.updateApplicationStage);

// Recruiter / Interviewer Notes
router.post('/:id/notes', requireRole('recruiter', 'company_admin', 'interviewer'), applicationController.addNote);

module.exports = router;
