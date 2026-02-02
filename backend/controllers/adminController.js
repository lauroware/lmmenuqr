const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');
const Admin = require('../models/Admin');



// @desc    Solicitar reset de contraseña
// @route   POST /api/admin/forgot-password
// @access  Public
// @desc    Solicitar reset de contraseña
// @route   POST /api/admin/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Siempre respondemos igual (seguridad)
  const genericMsg = { message: 'Si el email existe, se enviará un link.' };

  const admin = await Admin.findOne({ email });
  if (!admin) return res.json(genericMsg);

  const resetToken = crypto.randomBytes(32).toString('hex');

  admin.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  admin.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min
  await admin.save();

  // Link al front (tu React)
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontend.replace(/\/$/, '')}/reset-password/${resetToken}`;

  const subject = 'Recuperar contraseña - MenuQR';
  const text =
`Hola ${admin.name || ''}

Recibimos un pedido para resetear tu contraseña.

Abrí este link para crear una nueva:
${resetUrl}

Este link vence en 15 minutos.
Si no fuiste vos, ignorá este correo.`;

  // Opcional: HTML lindo (si querés)
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.4">
      <h2>Recuperar contraseña</h2>
      <p>Hola ${admin.name || ''}</p>
      <p>Hacé click para crear una nueva contraseña (vence en <b>15 minutos</b>):</p>
      <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
      <p>Si no fuiste vos, ignorá este correo.</p>
    </div>
  `;

  try {
    await sendEmail({
      to: admin.email,
      subject,
      text,
      html,
    });

    return res.json(genericMsg);
  } catch (err) {
  console.error('❌ Error enviando email reset:', err);

  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpires = undefined;
  await admin.save();

  return res.status(500).json({
    message: 'No se pudo enviar el email de recuperación',
    detail: err?.message || String(err),
    code: err?.code || null,
    response: err?.response || null,
  });
}
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
