const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Admin login attempt received for email:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email dan password harus diisi"
            });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log('Admin not found for email:', email);
        } else {
            console.log('Admin record found:', { id: admin._id.toString(), email: admin.email });
        }
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Email atau password salah"
            });
        }

        const isMatch = await admin.comparePassword(password);
        console.log('Password compare result for', email, ':', isMatch);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Email atau password salah"
            });
        }

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.json({
            success: true,
            message: "Login admin berhasil",
            data: {
                token,
                admin: {
                    id: admin._id,
                    email: admin.email,
                    role: admin.role
                }
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server"
        });
    }
};
