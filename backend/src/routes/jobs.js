const express = require('express');
const router = express.Router();
const {
  getJobs, getJob, createJob, updateJob, archiveJob,
  getMyJobs, getRecruiterStats, getJobAnalytics, bulkAction,
  publishJob, closeJob, duplicateJob,
} = require('../controllers/jobController');
const { protect, requireRole } = require('../middleware/auth');

// ── Public routes ────────────────────────────────────────────────────────────
router.get('/', getJobs);

// ── Recruiter-only routes (must be declared before /:id to avoid conflicts) ──
router.use(protect, requireRole('recruiter'));
router.get('/recruiter/stats', getRecruiterStats);
router.get('/recruiter/my-jobs', getMyJobs);
router.get('/recruiter/analytics', getJobAnalytics);
router.post('/recruiter/bulk-action', bulkAction);
router.post('/', createJob);

// Specific job actions — placed before generic /:id so express matches them first
router.patch('/:id/publish', publishJob);
router.patch('/:id/close', closeJob);
router.post('/:id/duplicate', duplicateJob);

// Generic CRUD
router.get('/:id', getJob);
router.put('/:id', updateJob);
router.delete('/:id', archiveJob);

module.exports = router;

