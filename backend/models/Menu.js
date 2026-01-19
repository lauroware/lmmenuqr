const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
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

    // 👇 APARIENCIA (AHORA SÍ)
    theme: {
      primaryColor: { type: String, default: '#2563eb' },
      backgroundType: {
        type: String,
        enum: ['color', 'image'],
        default: 'color',
      },
      backgroundValue: { type: String, default: '#ffffff' },
      logoUrl: { type: String, default: '' },
      coverUrl: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Menu', menuSchema);
