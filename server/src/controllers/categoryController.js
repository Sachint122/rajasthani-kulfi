const Category = require('../models/Category');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a category
exports.addCategory = async (req, res) => {
  try {
    const { name, unit } = req.body;
    if (!name || !unit) return res.status(400).json({ error: 'Name and unit are required' });
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ error: 'Category already exists' });
    const category = new Category({ name, unit });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 