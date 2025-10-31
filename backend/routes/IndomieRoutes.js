const express = require('express');
const indomieController = require('../controllers/IndomieController');

const router = express.Router();

router.get('/', indomieController.getIndomieMenu);

router.get('/:id', indomieController.getIndomieMenuById);

module.exports = router;