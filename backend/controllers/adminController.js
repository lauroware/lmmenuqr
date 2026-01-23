const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

const generateToken = require('../utils/generateToken');
const Admin = require('../models/Admin');

// @desc    Solicitar reset de contraseña
// @route   POST /api/admin/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    // No revelamos si existe o no (buena práctica)
    return res.json({ message: 'Si el email existe, se enviará un link.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  admin.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  admin.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min

  await admin.save();

  // 👉 por ahora solo devolvemos el token (DESPUÉS mandamos mail)
  res.json({
    message: 'Token generado',
    resetToken,
  });
});

// @desc    Resetear contraseña
// @route   POST /api/admin/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const admin = await Admin.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!admin) {
    res.status(400);
    throw new Error('Token inválido o expirado');
  }

  admin.password = req.body.password;
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpires = undefined;

  await admin.save();

  res.json({ message: 'Contraseña actualizada correctamente' });
});

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      restaurantName: admin.restaurantName,
      phone: admin.phone,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new admin
// @route   POST /api/admin/register
// @access  Public
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, restaurantName, phone } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400);
    throw new Error('Admin already exists');
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    restaurantName,
    phone,
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      restaurantName: admin.restaurantName,
      phone: admin.phone,
      token: generateToken(admin._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin data');
  }
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select('-password');

  if (admin) {
    res.json(admin);
  } else {
    res.status(404);
    throw new Error('Admin not found');
  }
});

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private
const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (admin) {
    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.restaurantName = req.body.restaurantName || admin.restaurantName;
    admin.phone = req.body.phone || admin.phone;

    if (req.body.password) {
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      restaurantName: updatedAdmin.restaurantName,
      phone: updatedAdmin.phone,
      token: generateToken(updatedAdmin._id),
    });
  } else {
    res.status(404);
    throw new Error('Admin not found');
  }
});

module.exports = {
  authAdmin,
  registerAdmin,
  getAdminProfile,
  updateAdminProfile,
  forgotPassword,
  resetPassword,
};
