const express = require('express');
const router = express.Router();
const businessInfoController = require('../controllers/businessInfoController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, businessInfoController.getBusinessInfo);
router.put('/', protect, admin, businessInfoController.updateBusinessInfo);

module.exports = router; 