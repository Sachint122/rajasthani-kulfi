const User = require('../models/User');

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
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
    // Check if user already exists by phone
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ error: 'User already exists with this phone number' });
    // Create user with default password and role 'user'
    const user = new User({ name, phone, email: `${phone}@example.com`, password: phone, role: 'user' });
    await user.save();
    res.status(201).json({ id: user._id, name: user.name, phone: user.phone, role: user.role });
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