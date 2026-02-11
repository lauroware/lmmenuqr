const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },

    // 🆕 NUEVOS CAMPOS
    whatsapp: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    instagram: {
      type: String,
      default: "",
    },

    // ✅ Reset password
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);
