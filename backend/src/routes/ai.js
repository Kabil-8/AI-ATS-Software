const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.post('/parse-resume', aiController.parseResume);
router.get('/rank-candidates/:jobId', requireRole('recruiter', 'company_admin', 'interviewer'), aiController.rankCandidates);
router.post('/resume-feedback', aiController.getResumeFeedback);

module.exports = router;
