require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

// Determine MongoDB URI from environment (support both MONGO_URI and MONGODB_URI)
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('Error: MONGO_URI or MONGODB_URI is not set in environment.\nPlease create a backend/.env with MONGO_URI or MONGODB_URI configured.');
    process.exit(1);
}

// koneksi MongoDB
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

const seedAdmin = async () => {
    try {
        // hapus SEMUA admin lama
        await Admin.deleteMany({});

        // buat admin baru
        const admin = await Admin.create({
            email: 'fteatuntar@gmail.com',
            password: 'fteat196', // akan otomatis di-hash karena pre-save hook
            role: 'admin'
        });

        console.log('Admin berhasil dibuat:', admin);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
