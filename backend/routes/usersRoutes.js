const express = require('express');
const router = express.Router();
const {
    listUsers,
    getUserById,
    getUsersByNpm,
    getUsersByFaculty,
    getUsersByMajor,
    getUsersByName,
    getUsersByRole,
    deleteAccount,
    updateNickname
} = require('../controllers/usersController');
const { protect } = require('../middleware/auth');

// All user routes are protected by token
router.get('/', protect, listUsers); 
router.get('/id/:id', protect, getUserById);
router.get('/npm/:npm', protect, getUsersByNpm);
router.get('/faculty/:faculty', protect, getUsersByFaculty);
router.get('/major/:major', protect, getUsersByMajor);
router.get('/name/:name', protect, getUsersByName);
router.get('/role/:role', protect, getUsersByRole);

router.put('/update-nickname', protect, updateNickname);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
