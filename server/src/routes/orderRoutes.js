const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// User routes
router.post('/', protect, orderController.createOrder);
router.get('/my-orders', protect, orderController.getUserOrders);
router.get('/my-orders/:id', protect, orderController.getOrder);

// Admin routes
router.get('/admin/all', protect, admin, orderController.getAllOrders);
router.get('/admin/stats', protect, admin, orderController.getOrderStats);
router.put('/admin/:id/status', protect, admin, orderController.updateOrderStatus);

module.exports = router; 