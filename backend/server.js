const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes'); // ✅ NUEVO
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const cors = require('cors');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

// CORS configuration
// CORS configuration (robusta)
const allowedOrigins = [
  process.env.FRONTEND_URL,           // ej: https://tu-front.vercel.app
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Permitir llamadas sin Origin (Postman, curl, server-to-server)
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) return cb(null, true);

    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: false, // ✅ IMPORTANTE: si NO usás cookies, dejalo false
}));

app.options('*', cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('API is running...'));

app.use('/api/admin', adminRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/upload', require('./routes/uploadRoutes'));

// ✅ NUEVO: pedidos (crea PDF)
app.use('/api/orders', orderRoutes);

// ✅ NUEVO: servir PDFs por URL pública /orders/...
app.use('/orders', express.static(path.join(__dirname, 'public', 'orders')));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
