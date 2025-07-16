const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Get all sales
exports.getSales = async (req, res) => {
  try {
    const filter = {};
    if (req.query.customerPhone) {
      filter.customerPhone = req.query.customerPhone;
    }
    const sales = await Sale.find(filter).sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a sale and decrement product stock
exports.addSale = async (req, res) => {
  try {
    const { productId, quantity, customerName, customerPhone } = req.body;
    if (!productId || !quantity) return res.status(400).json({ error: 'Product and quantity are required' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Not enough stock' });
    // Decrement stock
    product.stock -= quantity;
    await product.save();
    // Create sale record
    const sale = new Sale({
      productId,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      quantity,
      price: product.price,
      total: product.price * quantity,
      customerName,
      customerPhone
    });
    await sale.save();
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 