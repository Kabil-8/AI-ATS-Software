const express = require('express');
const router = express.Router();
const { analyzeApplication, analyzeBatch, getAnalysisStatus } = require('../controllers/aiController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('recruiter'));

router.post('/analyze/:applicationId', analyzeApplication);
router.post('/analyze-batch/:jobId', analyzeBatch);
router.get('/status/:applicationId', getAnalysisStatus);

module.exports = router;
