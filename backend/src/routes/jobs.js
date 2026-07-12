const express = require('express');
const router = express.Router();
const {
  getJobs, getJob, createJob, updateJob, archiveJob,
  getMyJobs, getRecruiterStats,
} = require('../controllers/jobController');
const { protect, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Recruiter-only routes
router.use(protect, requireRole('recruiter'));
router.get('/recruiter/stats', getRecruiterStats);
router.get('/recruiter/my-jobs', getMyJobs);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', archiveJob);

module.exports = router;
