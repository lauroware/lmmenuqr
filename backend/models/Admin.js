const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = mongoose.Schema(
  {
    name:           { type: String, required: true },
    email:          { type: String, required: true, unique: true },
    password:       { type: String, required: true },
    restaurantName: { type: String, required: true },
    phone:          { type: String, required: true },

    whatsapp:  { type: String, default: '' },
    address:   { type: String, default: '' },
    instagram: { type: String, default: '' },

    isActive:     { type: Boolean, default: true },
    isSuperAdmin: { type: Boolean, default: false },

    paymentMethods: { type: [String], default: [] },
    paymentMethodPercents: { type: Map, of: Number, default: {} },

    // ── MEMBRESÍA ──────────────────────────────────────────────────────
    // Fecha en que vence el trial gratuito (30 días desde el registro)
    trialEndsAt: { type: Date, default: null },

    // Fecha hasta la que la membresía paga está activa
    membershipPaidUntil: { type: Date, default: null },

    // Estado calculable: 'trial' | 'active' | 'expired' | 'blocked'
    // No se guarda en DB — se calcula en runtime — pero guardamos el historial
    membershipActivatedAt: { type: Date, default: null },

    // 🔐 Reset password
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// ── Método: calcular estado actual de la membresía ─────────────────────
adminSchema.methods.getMembershipStatus = function () {
  const now = new Date();

  // Cuenta bloqueada manualmente
  if (!this.isActive) return 'blocked';

  // Membresía paga vigente
  if (this.membershipPaidUntil && this.membershipPaidUntil > now) return 'active';

  // Trial vigente
  if (this.trialEndsAt && this.trialEndsAt > now) return 'trial';

  // Trial o membresía vencidos
  return 'expired';
};

// ── Método: días restantes del trial ──────────────────────────────────
adminSchema.methods.trialDaysLeft = function () {
  if (!this.trialEndsAt) return 0;
  const diff = this.trialEndsAt - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
