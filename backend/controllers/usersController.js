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

// PUT /api/users/update-nickname - Update nickname saja
exports.updateNickname = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nickname } = req.body;

        // Validasi nickname tidak boleh kosong string, tapi boleh null
        if (nickname !== null && nickname !== undefined && nickname.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Nickname tidak boleh kosong'
            });
        }

        // Update nickname di database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { nickname: nickname ? nickname.trim() : null },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        return res.json({
            success: true,
            message: 'Nickname berhasil diupdate',
            data: updatedUser
        });

    } catch (error) {
        console.error('Update nickname error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};
exports.updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({
        success: false,
        message: 'Profile image tidak boleh kosong'
      });
    }

    if (!profileImage.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Format gambar tidak valid'
      });
    }

    // Validasi ukuran base64 (approx 1.37x ukuran file asli)
    // Jika base64 > 6.8MB, maka file asli > 5MB
    const base64Size = profileImage.length * 0.75; // Convert to bytes
    if (base64Size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Ukuran gambar terlalu besar. Maksimal 5MB'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    return res.json({
      success: true,
      message: 'Profile image berhasil diupdate',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update profile image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

exports.deleteAccount = async (req, res) => {
    try {
        // Get user from req object (added by auth middleware)
        const userId = req.user.id;

        // Delete the user from database
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Akun berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};