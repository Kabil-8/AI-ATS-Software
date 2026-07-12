const express = require('express');
const router = express.Router();
const {
  createApplication, getMyApplications, getJobApplications,
  getApplication, updateStatus, addNote,
} = require('../controllers/applicationController');
const { protect, requireRole } = require('../middleware/auth');
const { upload, uploadMemory } = require('../middleware/upload');

// Use S3 upload in production, memory in dev (if S3 not configured)
const resumeUpload = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key_id'
  ? upload.single('resume')
  : uploadMemory.single('resume');

// Applicant routes
router.post('/', protect, requireRole('applicant'), resumeUpload, createApplication);
router.get('/my', protect, requireRole('applicant'), getMyApplications);

// Recruiter routes
router.get('/job/:jobId', protect, requireRole('recruiter'), getJobApplications);
router.patch('/:id/status', protect, requireRole('recruiter'), updateStatus);
router.post('/:id/notes', protect, requireRole('recruiter'), addNote);

// Shared
router.get('/:id', protect, getApplication);

module.exports = router;
