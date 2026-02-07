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

    // ✅ Apariencia
    theme: {
      primaryColor: { type: String, default: '#2563eb' },
      backgroundType: { type: String, enum: ['color', 'image'], default: 'color' },
      backgroundValue: { type: String, default: '#f3f4f6' }, // color o URL si es image
      logoUrl: { type: String, default: '' },
      coverUrl: { type: String, default: '' },
      layout: { type: String, enum: ['grid', 'list', 'accordion', 'classic', 'ultra-elegant', 'cafe-typewriter', 'cafe-relax' ], default: 'grid' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);
