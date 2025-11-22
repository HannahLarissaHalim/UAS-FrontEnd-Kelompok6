const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// 1. Import Library untuk Cloudinary dan File Upload
const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload');

// Load environment variables FIRST
dotenv.config();
connectDB();

// 2. Konfigurasi Cloudinary (Mengambil data dari .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Import Express routes
const menuRoutes = require('./routes/menuRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const kantinBursaRoutes = require('./routes/KantinBursaRoutes');
const indomieRoutes = require('./routes/IndomieRoutes');
const vendorAuthRoutes = require('./routes/vendorAuth');

// Import Controllers (DIKEMBALIKAN SEMUA, meskipun beberapa hanya digunakan oleh Native HTTP Server sebelumnya, 
// ini mencegah error ReferenceError jika mereka dibutuhkan di tempat lain)
const authController = require('./controllers/authController');
const userController = require('./controllers/usersController');
const menuController = require('./controllers/menuController');
const vendorController = require('./controllers/vendorController');
const vendorAuthController = require('./controllers/vendorAuthController');
const kantinBursaController = require('./controllers/KantinBursaController');
const indomieController = require('./controllers/IndomieController');
const orderController = require('./controllers/orderController');

const PORT_EXPRESS = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ======================================================
// EXPRESS SERVER (DIPERTAHANKAN)
// ======================================================
const app = express();

// FIXED: Middleware CORS untuk mengizinkan Next.js mengakses API
app.use(cors({ origin: CLIENT_URL, credentials: true })); 

// Middleware express-fileupload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/' // Direktori sementara
}));

// Body Parsers 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/vendors', vendorRoutes);
app.use('/api/kantinbursa', kantinBursaRoutes);
app.use('/api/indomie', indomieRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/usersRoutes'));
app.use('/api/menus', menuRoutes); // <-- Route Menu Anda di sini
app.use('/api/vendor', vendorAuthRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'FTEAT Backend API (Express)',
    version: '1.0.0',
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
});

// Route not found
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan' });
});

app.listen(PORT_EXPRESS, () => {
  console.log(`🚀 Express server running on port ${PORT_EXPRESS}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ⚠️ SELURUH BLOK HTTP NATIVE SERVER TELAH DIHAPUS DARI SINI

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Tutup server Express dan keluar
  app.close(() => process.exit(1)); 
});