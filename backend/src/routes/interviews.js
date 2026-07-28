const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.post('/', requireRole('recruiter', 'company_admin'), interviewController.scheduleInterview);
router.get('/', interviewController.getInterviews);
router.post('/:id/feedback', requireRole('interviewer', 'recruiter', 'company_admin'), interviewController.submitFeedback);

module.exports = router;
