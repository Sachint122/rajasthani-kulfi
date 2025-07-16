const Product = require('../models/Product');
const ProductName = require('../models/ProductName');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all products (admin)
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, isAvailable, unit, stock } = req.body;
        const product = new Product({
            name,
            description: description || '',
            price,
            category,
            image,
            isAvailable,
            unit,
            stock
        });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get product statistics (admin only)
exports.getProductStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const availableProducts = await Product.countDocuments({ isAvailable: true });
        const unavailableProducts = await Product.countDocuments({ isAvailable: false });

        res.json({
            totalProducts,
            availableProducts,
            unavailableProducts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ 
            category: req.params.category,
            isAvailable: true 
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 

// Product Name CRUD
exports.getProductNames = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) query.category = category;
    const names = await ProductName.find(query).sort({ name: 1 });
    res.json(names);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addProductName = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category are required' });
    const exists = await ProductName.findOne({ name, category });
    if (exists) return res.status(400).json({ error: 'Product name already exists for this category' });
    const productName = new ProductName({ name, category });
    await productName.save();
    res.status(201).json(productName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProductName = async (req, res) => {
  try {
    const productName = await ProductName.findByIdAndDelete(req.params.id);
    if (!productName) return res.status(404).json({ error: 'Product name not found' });
    res.json({ message: 'Product name deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 