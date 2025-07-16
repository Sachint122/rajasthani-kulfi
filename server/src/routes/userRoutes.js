const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, userController.getUsers);
router.post('/', protect, admin, userController.addUser);
router.delete('/:id', protect, admin, userController.deleteUser);

module.exports = router; 