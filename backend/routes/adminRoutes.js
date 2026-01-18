const express = require('express');
const { authAdmin, registerAdmin, getAdminProfile, updateAdminProfile } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authAdmin);
router.post('/register', registerAdmin);

// Protected routes
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);

module.exports = router;