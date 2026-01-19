const mongoose = require('mongoose');

const menuSchema = mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Admin',
    },
    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },

    // ✅ Theme (Apariencia)
    theme: {
      primaryColor: { type: String, default: '#2563eb' }, // azul
      backgroundType: { type: String, enum: ['color', 'image'], default: 'color' },
      backgroundValue: { type: String, default: '#f3f4f6' }, // color o URL si es image
      logoUrl: { type: String, default: '' },
      coverUrl: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
