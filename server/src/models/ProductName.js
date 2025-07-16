const mongoose = require('mongoose');

const ProductNameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ProductName', ProductNameSchema); 