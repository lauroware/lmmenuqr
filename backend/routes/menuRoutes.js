const express = require('express');
const {
  createMenu, getAdminMenu, createMenuItem, getMenuItems,
  getMenuItemById, updateMenuItem, deleteMenuItem,
  getPublicMenu, getQrCode, regenerateMenuLink,
  updateMenuTheme, reorderMenuItems,
} = require('../controllers/menuController');
const { protect }           = require('../middleware/authMiddleware');
const { checkMembership }   = require('../middleware/checkMembership');

const router = express.Router();

router.route('/').post(protect, createMenu).get(protect, getAdminMenu);

router.put('/theme', protect, updateMenuTheme);
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

// ⬇️ Menú público — verificamos membresía antes de renderizar
router.get('/:uniqueId', checkMembership, getPublicMenu);

module.exports = router;
