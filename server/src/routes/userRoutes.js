const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, userController.getUsers);
router.post('/', protect, admin, userController.addUser);
router.delete('/:id', protect, admin, userController.deleteUser);
router.patch('/:id', protect, admin, userController.updateUser);
router.get('/records', protect, admin, userController.getUserRecords);
router.post('/transaction', protect, admin, userController.addUserTransaction);

module.exports = router; 