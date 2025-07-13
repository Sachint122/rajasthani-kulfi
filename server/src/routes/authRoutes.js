const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getCurrentUser);

// Refresh token route - gets fresh user data and generates new token
router.post('/refresh-token', protect, async (req, res) => {
    try {
        const User = require('../models/User');
        const jwt = require('jsonwebtoken');
        
        // Get fresh user data from database
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Generate new JWT token with current user data
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            message: 'Token refreshed successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            },
            token
        });
    } catch (err) {
        console.error('Token refresh error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 