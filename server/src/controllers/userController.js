const User = require('../models/User');
const Sale = require('../models/Sale');
const UserTransaction = require('../models/UserTransaction');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a user (admin only)
exports.addUser = async (req, res) => {
  try {
    const { name, phone, lastValue } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
    // Check if user already exists by phone
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ error: 'User already exists with this phone number' });
    // Create user with default password and role 'user'
    const user = new User({ name, phone, email: `${phone}@example.com`, password: phone, role: 'user', lastValue });
    await user.save();
    res.status(201).json({ id: user._id, name: user.name, phone: user.phone, role: user.role, lastValue: user.lastValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a user's lastValue (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { lastValue } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (typeof lastValue !== 'undefined') user.lastValue = lastValue;
    await user.save();
    res.json({ id: user._id, name: user.name, phone: user.phone, role: user.role, lastValue: user.lastValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all sales and transactions for a user by phone
exports.getUserRecords = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });
    const sales = await Sale.find({ customerPhone: phone }).sort({ date: 1 });
    const transactions = await UserTransaction.find({ customerPhone: phone }).sort({ date: 1 });
    res.json({ sales, transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a user transaction/payment
exports.addUserTransaction = async (req, res) => {
  try {
    const { customerPhone, amount, date, note } = req.body;
    if (!customerPhone || !amount) return res.status(400).json({ error: 'Phone and amount are required' });
    const transaction = new UserTransaction({ customerPhone, amount, date, note });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 