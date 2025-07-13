const Order = require('../models/Order');
const Product = require('../models/Product');

// Create order
exports.createOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, phone, orderType, specialInstructions } = req.body;
        
        // Calculate total and validate items
        let totalAmount = 0;
        for (let item of items) {
            const product = await Product.findById(item.product);
            if (!product || !product.isAvailable) {
                return res.status(400).json({ error: `Product ${product?.name || 'Unknown'} is not available` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }
            totalAmount += product.price * item.quantity;
            
            // Update stock
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        const order = new Order({
            user: req.user.userId,
            items: items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            deliveryAddress,
            phone,
            orderType,
            specialInstructions
        });

        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email phone')
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('items.product');
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Check if user is authorized to view this order
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status, paymentStatus },
            { new: true }
        ).populate('user', 'name email phone')
         .populate('items.product');
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get order statistics (admin)
exports.getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 