const asyncHandler = require('express-async-handler');
const QRCode = require('qrcode');
const Menu = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const generateUniqueId = require('../utils/generateUniqueId');
const Admin = require('../models/Admin');



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
    res.status(404);
    throw new Error('Menu not found for this admin. Create a menu first.');
  }

  const { name, description, price, category, image, tags, available } = req.body;

  // ✅ calcular next order
  const last = await MenuItem.findOne({ menu: menu._id })
    .sort({ order: -1 })
    .select('order');

  const nextOrder = last?.order !== undefined ? last.order + 1 : 0;

  const menuItemData = {
    menu: menu._id,
    name,
    description,
    price,
    category,
    image,
    tags: tags || [],
    available: available !== undefined ? available : true,
    order: nextOrder,
  };

  const menuItem = await MenuItem.create(menuItemData);
  res.status(201).json(menuItem);
});


// @desc    Get all menu items for logged-in admin's menu
// @route   GET /api/menu/items
// @access  Private
const getMenuItems = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ admin: req.admin._id });

  if (!menu) {
    res.status(404);
    throw new Error('Menu not found for this admin.');
  }

  const menuItems = await MenuItem
    .find({ menu: menu._id })
    .sort({ order: 1, createdAt: 1 });

  res.json(menuItems);
});


const reorderMenuItems = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ admin: req.admin._id });
  if (!menu) {
    res.status(404);
    throw new Error('Menu not found for this admin.');
  }

  const { items } = req.body; 
  // items: [{ _id, order }]

  if (!Array.isArray(items)) {
    res.status(400);
    throw new Error('Invalid payload');
  }

  // Actualizamos solo ítems del menú del admin
  const ops = items.map((it) => ({
    updateOne: {
      filter: { _id: it._id, menu: menu._id },
      update: { $set: { order: it.order } },
    },
  }));

  await MenuItem.bulkWrite(ops);
  res.json({ message: 'Order updated' });
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
// @desc    Get public menu by uniqueId
// @route   GET /api/menu/:uniqueId
// @access  Public
const getPublicMenu = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ uniqueId: req.params.uniqueId });

  if (!menu) {
    console.error('Error 404: Menu not found');
    res.status(404);
    throw new Error('Menu not found');
  }

  const [menuItems, admin] = await Promise.all([
  MenuItem.find({ menu: menu._id }).sort({ order: 1, createdAt: 1 }),
  Admin.findById(menu.admin)
    .select('whatsapp address instagram phone paymentMethods')
    .lean(),
]);

  const whatsapp = String(admin?.whatsapp || admin?.phone || '').trim();
  const address = String(admin?.address || '').trim();
  const instagram = String(admin?.instagram || '').trim().replace(/^@/, '');

 res.json({
  restaurantName: menu.restaurantName,
  uniqueId: menu.uniqueId,
  theme: menu.theme || {},
  menuItems,

  whatsapp: String(admin?.whatsapp || admin?.phone || '').trim(),
  address: String(admin?.address || '').trim(),
  instagram: String(admin?.instagram || '').trim().replace(/^@/, ''),

  // ✅ acá está la clave
  paymentMethods: Array.isArray(admin?.paymentMethods) ? admin.paymentMethods : [],
});
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

const updateMenuTheme = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ admin: req.admin._id });

  if (!menu) {
    res.status(404);
    throw new Error('Menu not found');
  }

  // ✅ Sanitizamos (acá suelen venir los 500 por enum)
  const {
    primaryColor,
    backgroundType,
    backgroundValue,
    logoUrl,
    coverUrl,
    layout,
  } = req.body || {};

  const next = { ...(menu.theme || {}) };

  if (typeof primaryColor === 'string') next.primaryColor = primaryColor.trim();

  if (typeof backgroundType === 'string') {
    const bt = backgroundType.trim().toLowerCase();
    if (!['color', 'image'].includes(bt)) {
      // en vez de 500, devolvemos 400 claro
      res.status(400);
      throw new Error(`backgroundType inválido: "${backgroundType}". Usá "color" o "image"`);
    }
    next.backgroundType = bt;
  }

  if (typeof backgroundValue === 'string') next.backgroundValue = backgroundValue.trim();
  if (typeof logoUrl === 'string') next.logoUrl = logoUrl.trim();
  if (typeof coverUrl === 'string') next.coverUrl = coverUrl.trim();
if (typeof layout === 'string') {
  const l = layout.trim().toLowerCase();
  if (!['grid', 'list', 'accordion', 'classic', 'ultra-elegant', 'cafe-typewriter', 'cafe-relax', 'visual'].includes(l)) {
    res.status(400);
    throw new Error(`layout inválido: "${layout}". Usá "grid", "list",'ultra-elegant', 'cafe-typewriter' o "accordion", "cafe-relax", "visual"`);
  }
  next.layout = l;
}

  menu.theme = next;

  try {
    await menu.save();
  } catch (err) {
    // ✅ Esto te va a mostrar EL motivo real en Render logs
    console.error('❌ Theme save error:', err);

    // si es ValidationError, devolvemos 400 con detalle
    if (err.name === 'ValidationError') {
      res.status(400);
      throw new Error(err.message);
    }

    res.status(500);
    throw new Error('Error guardando theme');
  }

  res.json(menu.theme);
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
  updateMenuTheme,
  reorderMenuItems,
};
