// backend/middleware/checkMembership.js
// Aplica solo a rutas públicas del menú.
// Bloquea el render si la cuenta está vencida o desactivada.

const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const Menu  = require('../models/Menu');

const checkMembership = asyncHandler(async (req, res, next) => {
  const { uniqueId } = req.params;
  if (!uniqueId) return next();

  // Buscamos el menú para obtener el admin dueño
  const menu = await Menu.findOne({ uniqueId }).lean();
  if (!menu) return next(); // el controller de menú ya maneja el 404

  const admin = await Admin.findById(menu.admin);
  if (!admin) return next();

  const status = admin.getMembershipStatus();

  if (status === 'expired' || status === 'blocked') {
    return res.status(403).json({
      ok: false,
      membershipExpired: true,
      status,
      message:
        status === 'blocked'
          ? 'Esta cuenta está desactivada.'
          : 'El período de prueba o membresía de este comercio venció. Por favor contacte al administrador.',
    });
  }

  next();
});

module.exports = { checkMembership };
