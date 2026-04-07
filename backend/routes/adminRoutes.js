const express = require('express');
const {
  authAdmin, registerAdmin, getAdminProfile, updateAdminProfile,
  forgotPassword, resetPassword,
} = require('../controllers/adminController');
const { protect, requireSuperAdmin } = require('../middleware/authMiddleware');
const { listAdmins, setAdminActive, activateMembership } = require('../controllers/superAdminController');

const router = express.Router();

// Públicas
router.post('/login',    authAdmin);
router.post('/register', registerAdmin);
router.post('/forgot-password',       forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Privadas — usuario logueado
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);

// Super admin
router.get('/super/admins',                          protect, requireSuperAdmin, listAdmins);
router.patch('/super/admins/:id/active',             protect, requireSuperAdmin, setAdminActive);
router.post('/super/admins/:id/activate-membership', protect, requireSuperAdmin, activateMembership);

module.exports = router;
