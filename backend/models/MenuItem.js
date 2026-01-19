const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL to the image
  },
  tags: {
    type: [String],
    default: [],
  },
  available: {
    type: Boolean,
    default: true,
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
  },order: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
