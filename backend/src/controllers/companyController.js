const Company = require('../models/Company');
const User = require('../models/User');
const { logActivity } = require('../middleware/auth');

// @desc    Get Current Company details
// @route   GET /api/companies/my-company
exports.getMyCompany = async (req, res) => {
  try {
    let company = null;
    if (req.user.company) {
      company = await Company.findById(req.user.company);
    } else if (req.user.companyName) {
      company = await Company.findOne({ name: req.user.companyName });
    }

    if (!company) {
      company = await Company.create({
        name: req.user.companyName || `${req.user.name}'s Organization`,
        departments: ['Engineering', 'Product', 'Design', 'Sales', 'HR'],
      });
      req.user.company = company._id;
      await req.user.save();
    }

    const recruiters = await User.find({ company: company._id }).select('name email role jobTitle department isActive');

    res.status(200).json({
      success: true,
      company,
      recruiters,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Company details
// @route   PUT /api/companies/my-company
exports.updateCompany = async (req, res) => {
  try {
    if (!req.user.company) {
      return res.status(404).json({ success: false, message: 'No company associated with user' });
    }

    const company = await Company.findByIdAndUpdate(req.user.company, req.body, { new: true, runValidators: true });
    await logActivity(req, 'UPDATE', 'Company', company._id, 'Updated company profile details');

    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Department to Company
// @route   POST /api/companies/departments
exports.addDepartment = async (req, res) => {
  try {
    const { department } = req.body;
    if (!department) return res.status(400).json({ success: false, message: 'Department name is required' });

    const company = await Company.findById(req.user.company);
    if (!company.departments.includes(department)) {
      company.departments.push(department);
      await company.save();
    }

    res.status(200).json({ success: true, departments: company.departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Super Admin: List all companies
// @route   GET /api/companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: companies.length, companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Super Admin: Suspend or reinstate company
// @route   PUT /api/companies/:id/suspend
exports.toggleCompanySuspension = async (req, res) => {
  try {
    const { isSuspended, reason } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    company.isSuspended = isSuspended;
    company.suspendedAt = isSuspended ? new Date() : null;
    company.suspensionReason = isSuspended ? reason : null;
    await company.save();

    await logActivity(req, isSuspended ? 'SUSPEND' : 'REINSTATE', 'Company', company._id, reason || 'Suspension toggled');

    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
