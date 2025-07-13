const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Combined admin stats endpoint
router.get('/stats', protect, admin, adminController.getAdminStats);

module.exports = router; 