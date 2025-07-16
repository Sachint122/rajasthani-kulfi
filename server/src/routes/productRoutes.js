const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

// Product name routes (must be before /:id)
router.get('/names', productController.getProductNames);
router.post('/names', protect, admin, productController.addProductName);
router.delete('/names/:id', protect, admin, productController.deleteProductName);

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Admin routes
router.post('/', protect, admin, productController.createProduct);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);
router.get('/admin/stats', protect, admin, productController.getProductStats);

module.exports = router; 