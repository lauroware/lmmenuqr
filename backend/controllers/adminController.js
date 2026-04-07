const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
const Admin = require('../models/Admin');
const send  = require('../utils/send');

const TRIAL_DAYS = 30;
const MEMBERSHIP_PRICE_ARS = 15000;

const publicFields = (admin) => ({
  _id:                   admin._id,
  name:                  admin.name,
  email:                 admin.email,
  restaurantName:        admin.restaurantName,
  phone:                 admin.phone,
  whatsapp:              admin.whatsapp,
  address:               admin.address,
  instagram:             admin.instagram,
  isActive:              admin.isActive,
  paymentMethods:        admin.paymentMethods,
  paymentMethodPercents: admin.paymentMethodPercents,
  trialEndsAt:           admin.trialEndsAt,
  membershipPaidUntil:   admin.membershipPaidUntil,
  membershipStatus:      admin.getMembershipStatus(),
  trialDaysLeft:         admin.trialDaysLeft(),
});

// ── Forgot password ────────────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const genericMsg = { message: 'Si el email existe, se enviará un link.' };
  const admin = await Admin.findOne({ email });
  if (!admin) return res.json(genericMsg);

  const resetToken = crypto.randomBytes(32).toString('hex');
  admin.resetPasswordToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
  admin.resetPasswordExpires = Date.now() + 1000 * 60 * 15;
  await admin.save();

  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontend.replace(/\/$/, '')}/reset-password/${resetToken}`;

  try {
    await send({
      to: admin.email,
      subject: 'Recuperar contraseña - MenuQR',
      text: `Hola ${admin.name}\n\nAbrí este link:\n${resetUrl}\n\nVence en 15 minutos.`,
      html: `<p>Hola <b>${admin.name}</b></p><p><a href="${resetUrl}">Resetear contraseña</a> (vence en 15 min)</p>`,
    });
    return res.json(genericMsg);
  } catch (err) {
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();
    return res.status(500).json({ message: 'No se pudo enviar el email', detail: err?.message });
  }
});

// ── Reset password ─────────────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const admin = await Admin.findOne({
    resetPasswordToken:   hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!admin) { res.status(400); throw new Error('Token inválido o expirado'); }
  admin.password = req.body.password;
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpires = undefined;
  await admin.save();
  res.json({ message: 'Contraseña actualizada correctamente' });
});

// ── Login ──────────────────────────────────────────────────────────────
const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    // Aviso si quedan <= 7 días de trial
    if (admin.getMembershipStatus() === 'trial' && admin.trialDaysLeft() <= 7) {
      send({
        to: admin.email,
        subject: '⚠️ Tu período de prueba está por vencer - MenuQR',
        text: `Hola ${admin.name},\n\nTe quedan ${admin.trialDaysLeft()} días de prueba.\nPara continuar: ${process.env.CONTACT_EMAIL || 'hola@menuqr.com'}\nMembresía: $${MEMBERSHIP_PRICE_ARS} ARS/mes.`,
        html: `<p>Hola <b>${admin.name}</b>, te quedan <b>${admin.trialDaysLeft()} días</b> de prueba. Contactanos a <a href="mailto:${process.env.CONTACT_EMAIL || 'hola@menuqr.com'}">${process.env.CONTACT_EMAIL || 'hola@menuqr.com'}</a> para renovar ($${MEMBERSHIP_PRICE_ARS} ARS/mes).</p>`,
      }).catch(() => {});
    }

    res.json({ ...publicFields(admin), token: generateToken(admin._id) });
  } else {
    res.status(401);
    throw new Error('Email o contraseña incorrectos');
  }
});

// ── Register ───────────────────────────────────────────────────────────
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, restaurantName, phone, whatsapp, address, instagram } = req.body;

  const adminExists = await Admin.findOne({ email });
  if (adminExists) { res.status(400); throw new Error('Ya existe una cuenta con ese email'); }

  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  const admin = await Admin.create({
    name, email, password, restaurantName, phone,
    whatsapp:  whatsapp  || '',
    address:   address   || '',
    instagram: (instagram || '').replace(/^@/, ''),
    trialEndsAt,
  });

  if (admin) {
    send({
      to: admin.email,
      subject: '¡Bienvenido a MenuQR! Tu período de prueba comenzó',
      text: `Hola ${admin.name},\n\n¡Bienvenido!\nTu prueba gratuita de ${TRIAL_DAYS} días vence el ${trialEndsAt.toLocaleDateString('es-AR')}.\nAl vencer, podés renovar por $${MEMBERSHIP_PRICE_ARS} ARS/mes contactando a ${process.env.CONTACT_EMAIL || 'hola@menuqr.com'}.`,
      html: `<h2>¡Bienvenido, ${admin.name}!</h2><p>Tu prueba gratuita de <b>${TRIAL_DAYS} días</b> vence el <b>${trialEndsAt.toLocaleDateString('es-AR')}</b>.</p><p>Membresía mensual: <b>$${MEMBERSHIP_PRICE_ARS} ARS</b> — contactanos a <a href="mailto:${process.env.CONTACT_EMAIL || 'hola@menuqr.com'}">${process.env.CONTACT_EMAIL || 'hola@menuqr.com'}</a></p>`,
    }).catch(() => {});

    res.status(201).json({ ...publicFields(admin), token: generateToken(admin._id) });
  } else {
    res.status(400); throw new Error('Datos inválidos');
  }
});

// ── Get profile ────────────────────────────────────────────────────────
const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select('-password');
  if (admin) res.json(publicFields(admin));
  else { res.status(404); throw new Error('Admin not found'); }
});

// ── Update profile ─────────────────────────────────────────────────────
const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);
  if (!admin) { res.status(404); throw new Error('Admin not found'); }

  admin.name           = req.body.name           || admin.name;
  admin.email          = req.body.email          || admin.email;
  admin.restaurantName = req.body.restaurantName || admin.restaurantName;
  admin.phone          = req.body.phone          || admin.phone;
  admin.whatsapp       = req.body.whatsapp  ?? admin.whatsapp;
  admin.address        = req.body.address   ?? admin.address;
  admin.instagram      = req.body.instagram ? req.body.instagram.replace(/^@/, '') : admin.instagram;

  if (Array.isArray(req.body.paymentMethods)) {
    admin.paymentMethods = req.body.paymentMethods.map(s => String(s).trim().toLowerCase()).filter(Boolean);
  }
  if (req.body.paymentMethodPercents && typeof req.body.paymentMethodPercents === 'object') {
    const next = {};
    for (const [k, v] of Object.entries(req.body.paymentMethodPercents)) {
      const key = String(k || '').trim().toLowerCase();
      const num = Number(v);
      if (!key || !Number.isFinite(num)) continue;
      next[key] = num;
    }
    admin.paymentMethodPercents = next;
  }
  if (req.body.password) admin.password = req.body.password;

  const updated = await admin.save();
  res.json({ ...publicFields(updated), token: generateToken(updated._id) });
});
//lauro 


module.exports = { authAdmin, registerAdmin, getAdminProfile, updateAdminProfile, forgotPassword, resetPassword };
