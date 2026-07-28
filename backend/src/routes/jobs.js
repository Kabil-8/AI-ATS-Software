const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', jobController.getJobs);
router.get('/recruiter/my-jobs', protect, requireRole('recruiter', 'company_admin'), jobController.getMyJobs);
router.get('/recruiter/stats', protect, requireRole('recruiter', 'company_admin'), jobController.getRecruiterStats);
router.get('/:id', jobController.getJobById);

router.post('/', protect, requireRole('recruiter', 'company_admin'), jobController.createJob);
router.put('/:id', protect, requireRole('recruiter', 'company_admin'), jobController.updateJob);
router.post('/:id/duplicate', protect, requireRole('recruiter', 'company_admin'), jobController.duplicateJob);
router.delete('/:id', protect, requireRole('recruiter', 'company_admin'), jobController.deleteJob);
router.post('/:id/bookmark', protect, requireRole('candidate', 'applicant'), jobController.toggleBookmark);

module.exports = router;
