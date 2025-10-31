const express = require('express');
const kantinBursaController = require('../controllers/KantinBursaController');

const router = express.Router();

router.get('/', kantinBursaController.getKantinBursaMenus);

router.get('/:id', kantinBursaController.getKantinBursaMenuById);

module.exports = router;