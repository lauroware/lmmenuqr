const express = require('express');
const {
  createMenu,
  getAdminMenu,
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  getPublicMenu,
  getQrCode,
  regenerateMenuLink,
  updateMenuTheme, // ✅
} = require('../controllers/menuController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createMenu).get(protect, getAdminMenu);

// ✅ tiene que ir ANTES de /:uniqueId
router.put('/theme', protect, updateMenuTheme);

router.route('/items').post(protect, createMenuItem).get(protect, getMenuItems);
router.route('/items/:id').get(protect, getMenuItemById).put(protect, updateMenuItem).delete(protect, deleteMenuItem);
router.put('/items/reorder', protect, reorderMenuItems);


router.post('/regenerate-link', protect, regenerateMenuLink);
router.get('/qr/:uniqueId', getQrCode);

// ✅ SIEMPRE al final
router.get('/:uniqueId', getPublicMenu);

module.exports = router;
