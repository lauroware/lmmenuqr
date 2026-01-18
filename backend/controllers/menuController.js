const asyncHandler = require('express-async-handler');
const QRCode = require('qrcode');
const Menu = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const generateUniqueId = require('../utils/generateUniqueId');

// @desc    Create a menu for the logged-in admin
// @route   POST /api/menu
// @access  Private
const createMenu = asyncHandler(async (req, res) => {
  const { restaurantName } = req.body;
  
  const menuExists = await Menu.findOne({ admin: req.admin._id });

  if (menuExists) {
    console.error('Error 400: Menu already exists for this admin');
    res.status(400);
    throw new Error('Menu already exists for this admin');
  }

  const uniqueId = generateUniqueId();

  const menu = await Menu.create({
    admin: req.admin._id,
    restaurantName,
    uniqueId,
  });

  if (menu) {
    res.status(201).json({
      _id: menu._id,
      admin: menu.admin,
      restaurantName: menu.restaurantName,
      uniqueId: menu.uniqueId,
    });
  } else {
    console.error('Error 400: Invalid menu data');
    res.status(400);
    throw new Error('Invalid menu data');
  }
});

// @desc    Get menu for logged-in admin
// @route   GET /api/menu
// @access  Private
const getAdminMenu = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ admin: req.admin._id });

  if (menu) {
    res.json(menu);
  } else {
    console.error('Error 404: Menu not found for this admin');
    res.status(404);
    throw new Error('Menu not found for this admin');
  }
});

// @desc    Create new menu item
// @route   POST /api/menu/items
// @access  Private
const createMenuItem = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ admin: req.admin._id });

  if (!menu) {
    console.error('Error 404: Menu not found for this admin. Create a menu first.');
    res.status(404);
    throw new Error('Menu not found for this admin. Create a menu first.');
  }

  try {
    const { name, description, price, category, image, tags, available } = req.body;

    const menuItemData = {
      menu: menu._id,
      name,
      description,
      price,
      category,
      image,
      tags: tags || [],
      available: available !== undefined ? available : true,
    };

    const menuItem = new MenuItem(menuItemData);
    const createdMenuItem = await menuItem.save();
    res.status(201).json(createdMenuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    console.error('Validation errors:', error.errors);
    res.status(400);
    throw new Error('Invalid menu item data');
  }
});


// @desc    Get all menu items for logged-in admin's menu
// @route   GET /api/menu/items
// @access  Private
const getMenuItems = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ admin: req.admin._id });

  if (!menu) {
    console.error('Error 404: Menu not found for this admin.');
    res.status(404);
    throw new Error('Menu not found for this admin.');
  }

  const menuItems = await MenuItem.find({ menu: menu._id });
  res.json(menuItems);
});

// @desc    Get single menu item by ID
// @route   GET /api/menu/items/:id
// @access  Private
const getMenuItemById = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (menuItem) {
    const menu = await Menu.findOne({ admin: req.admin._id });
    if (menu && menuItem.menu.toString() === menu._id.toString()) {
      res.json(menuItem);
    } else {
      console.error('Error 401: Not authorized to view this menu item');
      res.status(401);
      throw new Error('Not authorized to view this menu item');
    }
  } else {
    console.error('Error 404: Menu item not found');
    res.status(404);
    throw new Error('Menu item not found');
  }
});

// @desc    Update a menu item
// @route   PUT /api/menu/items/:id
// @access  Private
const updateMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, image, tags, available } = req.body;

  const menuItem = await MenuItem.findById(req.params.id);

  if (menuItem) {
    const menu = await Menu.findOne({ admin: req.admin._id });
    if (menu && menuItem.menu.toString() === menu._id.toString()) {
      menuItem.name = name || menuItem.name;
      menuItem.description = description || menuItem.description;
      menuItem.price = price || menuItem.price;
      menuItem.category = category || menuItem.category;
      menuItem.image = image || menuItem.image;
      menuItem.tags = tags || menuItem.tags;
      menuItem.available = available !== undefined ? available : menuItem.available;

      try {
        const updatedMenuItem = await menuItem.save();
        res.json(updatedMenuItem);
      } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(400);
        throw new Error('Invalid menu item data');
      }
    } else {
      console.error('Error 401: Not authorized to update this menu item');
      res.status(401);
      throw new Error('Not authorized to update this menu item');
    }
  } else {
    console.error('Error 404: Menu item not found');
    res.status(404);
    throw new Error('Menu item not found');
  }
});

// @desc    Delete a menu item
// @route   DELETE /api/menu/items/:id
// @access  Private
const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (menuItem) {
    const menu = await Menu.findOne({ admin: req.admin._id });
    if (menu && menuItem.menu.toString() === menu._id.toString()) {
      await menuItem.deleteOne();
      res.json({ message: 'Menu item removed' });
    } else {
      console.error('Error 401: Not authorized to delete this menu item');
      res.status(401);
      throw new Error('Not authorized to delete this menu item');
    }
  } else {
    console.error('Error 404: Menu item not found');
    res.status(404);
    throw new Error('Menu item not found');
  }
});

// @desc    Get public menu by uniqueId
// @route   GET /api/menu/:uniqueId
// @access  Public
const getPublicMenu = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ uniqueId: req.params.uniqueId });

  if (menu) {
    const menuItems = await MenuItem.find({ menu: menu._id });
    res.json({ restaurantName: menu.restaurantName, menuItems });
  } else {
    console.error('Error 404: Menu not found');
    res.status(404);
    throw new Error('Menu not found');
  }
});

// @desc    Generate QR code for the menu
// @route   GET /api/menu/qr/:uniqueId
// @access  Public
const getQrCode = asyncHandler(async (req, res) => {
  const { uniqueId } = req.params;
  const menuUrl = `${req.protocol}://${req.get('host')}/menu/${uniqueId}`;

  try {
    const qrCodeImage = await QRCode.toDataURL(menuUrl);
    res.json({ qrCode: qrCodeImage });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating QR code');
  }
});

// @desc    Regenerate menu link
// @route   POST /api/menu/regenerate-link
// @access  Private
const regenerateMenuLink = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ admin: req.admin._id });

  if (!menu) {
    res.status(404);
    throw new Error('Menu not found for this admin');
  }

  const newUniqueId = generateUniqueId();
  menu.uniqueId = newUniqueId;
  
  try {
    const updatedMenu = await menu.save();
    res.json({
      _id: updatedMenu._id,
      admin: updatedMenu.admin,
      restaurantName: updatedMenu.restaurantName,
      uniqueId: updatedMenu.uniqueId,
    });
  } catch (error) {
    console.error('Error regenerating menu link:', error);
    res.status(400);
    throw new Error('Failed to regenerate menu link');
  }
});

module.exports = {
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
};
