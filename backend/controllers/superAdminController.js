const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const send  = require('../utils/send');

const MEMBERSHIP_DAYS       = 30;
const MEMBERSHIP_PRICE_ARS  = 15000;

// GET /api/admin/super/admins
const listAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find({ isSuperAdmin: false })
    .select('restaurantName name email phone isActive createdAt trialEndsAt membershipPaidUntil membershipActivatedAt')
    .sort({ createdAt: -1 })
    .lean();

  // Agregamos los campos calculados manualmente (lean() no ejecuta métodos)
  const now = new Date();
  const result = admins.map((a) => {
    let membershipStatus;
    if (!a.isActive)                                          membershipStatus = 'blocked';
    else if (a.membershipPaidUntil && a.membershipPaidUntil > now) membershipStatus = 'active';
    else if (a.trialEndsAt && a.trialEndsAt > now)            membershipStatus = 'trial';
    else                                                       membershipStatus = 'expired';

    const trialDaysLeft = a.trialEndsAt
      ? Math.max(0, Math.ceil((new Date(a.trialEndsAt) - now) / (1000 * 60 * 60 * 24)))
      : 0;

    return { ...a, membershipStatus, trialDaysLeft };
  });

  res.json(result);
});

// PATCH /api/admin/super/admins/:id/active
const setAdminActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const admin = await Admin.findById(req.params.id);
  if (!admin) { res.status(404); throw new Error('Admin not found'); }
  admin.isActive = !!isActive;
  await admin.save();
  res.json({ _id: admin._id, isActive: admin.isActive });
});

// POST /api/admin/super/admins/:id/activate-membership
// El super admin activa la membresía manualmente (después de recibir el pago)
const activateMembership = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) { res.status(404); throw new Error('Admin not found'); }

  const now = new Date();

  // Si tiene membresía activa, la extendemos desde su vencimiento actual
  // Si no, arrancamos desde hoy
  const base = (admin.membershipPaidUntil && admin.membershipPaidUntil > now)
    ? admin.membershipPaidUntil
    : now;

  admin.membershipPaidUntil   = new Date(base.getTime() + MEMBERSHIP_DAYS * 24 * 60 * 60 * 1000);
  admin.membershipActivatedAt = now;
  admin.isActive              = true; // reactivar si estaba bloqueado

  await admin.save();

  // Email al usuario
  send({
    to: admin.email,
    subject: '✅ Tu membresía de MenuQR fue activada',
    text: `Hola ${admin.name},\n\nTu membresía fue activada hasta el ${admin.membershipPaidUntil.toLocaleDateString('es-AR')}.\n\n¡Gracias por confiar en MenuQR!`,
    html: `<h2>¡Membresía activada!</h2><p>Hola <b>${admin.name}</b>, tu membresía está activa hasta el <b>${admin.membershipPaidUntil.toLocaleDateString('es-AR')}</b>.</p><p>¡Gracias por confiar en MenuQR!</p>`,
  }).catch(() => {});

  res.json({
    _id:                  admin._id,
    membershipPaidUntil:  admin.membershipPaidUntil,
    membershipActivatedAt: admin.membershipActivatedAt,
    isActive:             admin.isActive,
  });
});

module.exports = { listAdmins, setAdminActive, activateMembership };
