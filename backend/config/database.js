const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Pastikan:');
    console.error('1. Koneksi internet stabil');
    console.error('2. IP address Anda sudah ditambahkan di MongoDB Atlas Network Access');
    console.error('3. Connection string di .env sudah benar');
    process.exit(1);
  }
};

module.exports = connectDB;
