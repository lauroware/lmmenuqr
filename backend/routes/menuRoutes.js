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
  updateMenuTheme,
  reorderMenuItems, // ✅ IMPORTANTE
} = require('../controllers/menuController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createMenu).get(protect, getAdminMenu);

// ✅ theme antes de /:uniqueId
router.put('/theme', protect, updateMenuTheme);

// ✅ reorder ANTES de /items/:id (por seguridad de matching)
router.put('/items/reorder', protect, reorderMenuItems);

router.route('/items')
  .post(protect, createMenuItem)
  .get(protect, getMenuItems);

router.route('/items/:id')
  .get(protect, getMenuItemById)
  .put(protect, updateMenuItem)
  .delete(protect, deleteMenuItem);

router.post('/regenerate-link', protect, regenerateMenuLink);
router.get('/qr/:uniqueId', getQrCode);

// ✅ al final
router.get('/:uniqueId', getPublicMenu);

module.exports = router;
