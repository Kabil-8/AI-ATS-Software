const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.get('/my-company', companyController.getMyCompany);
router.put('/my-company', requireRole('company_admin', 'recruiter'), companyController.updateCompany);
router.post('/departments', requireRole('company_admin', 'recruiter'), companyController.addDepartment);

// Super Admin Endpoints
router.get('/', requireRole('super_admin'), companyController.getAllCompanies);
router.put('/:id/suspend', requireRole('super_admin'), companyController.toggleCompanySuspension);

module.exports = router;
