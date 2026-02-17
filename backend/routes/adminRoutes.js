const express = require('express');
const { authAdmin, registerAdmin, getAdminProfile, updateAdminProfile } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireSuperAdmin } = require('../middleware/authMiddleware');
const { listAdmins, setAdminActive } = require('../controllers/superAdminController');

const router = express.Router();

router.post('/login', authAdmin);
router.post('/register', registerAdmin);

// Protected routes
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);

const {
  forgotPassword,
  resetPassword,
} = require('../controllers/adminController');

// 🔓 Público
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/super/admins', protect, requireSuperAdmin, listAdmins);
router.patch('/super/admins/:id/active', protect, requireSuperAdmin, setAdminActive);



module.exports = router;