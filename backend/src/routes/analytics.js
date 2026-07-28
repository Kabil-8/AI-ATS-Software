const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/dashboard', protect, requireRole('recruiter', 'company_admin', 'super_admin'), analyticsController.getDashboardAnalytics);

module.exports = router;
