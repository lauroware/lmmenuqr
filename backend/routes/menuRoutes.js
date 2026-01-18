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
} = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createMenu).get(protect, getAdminMenu);
router.route('/items').post(protect, createMenuItem).get(protect, getMenuItems);
router
  .route('/items/:id')
  .get(protect, getMenuItemById)
  .put(protect, updateMenuItem)
  .delete(protect, deleteMenuItem);

router.route('/regenerate-link').post(protect, regenerateMenuLink);
router.route('/qr/:uniqueId').get(getQrCode);
router.route('/:uniqueId').get(getPublicMenu);

module.exports = router;