const ActivityLog = require('../models/ActivityLog');

// @desc    Get Audit Logs
// @route   GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { entity, page = 1, limit = 20 } = req.query;
    const query = {};
    if (entity) query.entity = entity;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
