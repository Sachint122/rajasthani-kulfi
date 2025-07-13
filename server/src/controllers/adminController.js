const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get combined admin statistics
exports.getAdminStats = async (req, res) => {
    try {
        // Use Promise.all to run queries in parallel for better performance
        const [userStats, productStats, orderStats] = await Promise.all([
            // User stats
            User.aggregate([
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        activeUsers: {
                            $sum: { $cond: ['$isActive', 1, 0] }
                        }
                    }
                }
            ]),
            
            // Product stats
            Product.countDocuments(),
            
            // Order stats with revenue calculation
            Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        pendingOrders: {
                            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                        },
                        completedOrders: {
                            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                        },
                        totalRevenue: {
                            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0] }
                        }
                    }
                }
            ])
        ]);
        
        const combinedStats = {
            // User stats
            totalUsers: userStats[0]?.totalUsers || 0,
            activeUsers: userStats[0]?.activeUsers || 0,
            
            // Product stats
            totalProducts: productStats || 0,
            
            // Order stats
            totalOrders: orderStats[0]?.totalOrders || 0,
            pendingOrders: orderStats[0]?.pendingOrders || 0,
            completedOrders: orderStats[0]?.completedOrders || 0,
            totalRevenue: orderStats[0]?.totalRevenue || 0
        };
        
        res.json(combinedStats);
        
    } catch (error) {
        console.error('Error getting combined admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
}; 