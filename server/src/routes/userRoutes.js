const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// Update current user's phone number
router.patch('/update-phone', protect, async (req, res) => {
    try {
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        
        const User = require('../models/User');
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { phone },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update session storage data
        const updatedUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        };
        
        res.json({ 
            message: 'Phone number updated successfully', 
            user: updatedUser
        });
    } catch (err) {
        console.error('Error updating phone number:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin routes for user management
router.get('/admin/all', protect, admin, userController.getAllUsers);
router.get('/admin/stats', protect, admin, userController.getUserStats);
router.get('/admin/:id', protect, admin, userController.getUser);
router.put('/admin/:id', protect, admin, userController.updateUser);
router.delete('/admin/:id', protect, admin, userController.deleteUser);
router.patch('/admin/:id/toggle-status', protect, admin, userController.toggleUserStatus);

module.exports = router; 