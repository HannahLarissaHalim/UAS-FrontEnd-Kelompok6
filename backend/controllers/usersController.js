const User = require('../models/User');

// GET /api/users (ini juga support untuk query params)
exports.listUsers = async (req, res) => {
    try {
        const { id, npm, faculty, major, name, role } = req.query;

        const filter = {};

        if (id) filter._id = id;
        if (npm) filter.npm = npm;
        if (faculty) filter.facultyCode = faculty;
        if (major) filter.majorCode = major;
        if (role) filter.role = role;
        if (name) {
            filter.$or = [
                {
                    firstName: {
                        $regex: name,
                        $options: 'i'
                    }
                },
                {
                    lastName: {
                        $regex: name,
                        $options: 'i'
                    }
                }
            ];
        }

        const users = await User.find(filter).select('-password');

        return res.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};

// GET /api/users/id/:id
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }
        return res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};

// GET /api/users/npm/:npm
exports.getUsersByNpm = async (req, res) => {
    try {
        const { npm } = req.params;
        const user = await User.findOne({ npm }).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }
        return res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};

// GET /api/users/faculty/:faculty
exports.getUsersByFaculty = async (req, res) => {
    try {
        const { faculty } = req.params;
        const users = await User.find({ facultyCode: faculty }).select('-password');
        return res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};

// GET /api/users/major/:major
exports.getUsersByMajor = async (req, res) => {
    try {
        const { major } = req.params;
        const users = await User.find({ majorCode: major }).select('-password');
        return res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};

// GET /api/users/name/:name
exports.getUsersByName = async (req, res) => {
    try {
        const { name } = req.params;
        const users = await User.find({
            $or: [
                {
                    firstName: {
                        $regex: name,
                        $options: 'i'
                    }
                },
                {
                    lastName: {
                        $regex: name,
                        $options: 'i'
                    }
                }
            ]
        }).select('-password');

        return res.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};

// GET /api/users/role/:role
exports.getUsersByRole = async (req, res) => {

    try {
        const { role } = req.params;
        const users = await User.find({ role }).select('-password');
        return res.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }

};
