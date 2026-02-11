const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    restaurantName: { type: String, required: true },
    phone: { type: String, required: true },

    // 🆕 NUEVOS CAMPOS
    whatsapp: { type: String, default: "" },
    address: { type: String, default: "" },
    instagram: { type: String, default: "" },

    // ✅ Reset password
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  // IMPORTANTE: si no se modifica la pass, no rehashees
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ✅ ESTO ES CLAVE
module.exports = mongoose.model('Admin', adminSchema);
