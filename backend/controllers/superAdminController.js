const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');

const listAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find({})
    .select('restaurantName email phone isActive createdAt')
    .sort({ createdAt: -1 })
    .lean();

  res.json(admins);
});

const setAdminActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  admin.isActive = !!isActive;
  await admin.save();

  res.json({ _id: admin._id, isActive: admin.isActive });
});

module.exports = { listAdmins, setAdminActive };
