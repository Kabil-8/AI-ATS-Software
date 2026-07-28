const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('super_admin', 'company_admin'));

router.get('/audit-logs', auditController.getAuditLogs);

module.exports = router;
