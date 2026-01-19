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

    // ✅ Theme dentro del schema (no en parámetros)
    theme: {
      primaryColor: { type: String, default: '#2563eb' },
      backgroundType: { type: String, enum: ['color', 'image'], default: 'color' },
      backgroundValue: { type: String, default: '#ffffff' },
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
