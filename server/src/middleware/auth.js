const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        console.log('Protect middleware - token exists:', !!token);

        if (!token) {
            return res.status(401).json({ error: 'Not authorized to access this route' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Protect middleware - decoded token:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Protect middleware error:', err);
        res.status(401).json({ error: 'Not authorized to access this route' });
    }
};

// Admin only
exports.admin = (req, res, next) => {
    console.log('Admin middleware - user:', req.user);
    console.log('Admin middleware - user role:', req.user?.role);
    
    if (req.user && req.user.role === 'admin') {
        console.log('Admin access granted');
        next();
    } else {
        console.log('Admin access denied');
        res.status(403).json({ error: 'Admin access required' });
    }
};

// User only
exports.user = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        next();
    } else {
        res.status(403).json({ error: 'User access required' });
    }
}; 