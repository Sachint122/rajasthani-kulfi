const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, saleController.getSales);
router.post('/', protect, admin, saleController.addSale);

module.exports = router; 