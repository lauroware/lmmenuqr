const Menu = require('../models/Menu');

// PUT /api/menu/theme
// Protegido (admin logueado)
const updateMenuTheme = async (req, res) => {
  try {
    // asumimos que tu backend sabe identificar el menu del admin
    // si vos guardás menu por adminId, adaptá este findOne
    const menu = await Menu.findOne({ admin: req.user._id }); // <- ajustá si tu modelo no tiene "admin"

    if (!menu) {
      return res.status(404).json({ message: 'Menú no encontrado' });
    }

    const { primaryColor, backgroundType, backgroundValue, logoUrl, coverUrl } = req.body;

    menu.theme = {
      ...menu.theme,
      ...(primaryColor !== undefined ? { primaryColor } : {}),
      ...(backgroundType !== undefined ? { backgroundType } : {}),
      ...(backgroundValue !== undefined ? { backgroundValue } : {}),
      ...(logoUrl !== undefined ? { logoUrl } : {}),
      ...(coverUrl !== undefined ? { coverUrl } : {}),
    };

    const updated = await menu.save();
    res.json(updated);
  } catch (err) {
    console.error('updateMenuTheme error:', err);
    res.status(500).json({ message: 'Error actualizando apariencia' });
  }
};

module.exports = { updateMenuTheme };
