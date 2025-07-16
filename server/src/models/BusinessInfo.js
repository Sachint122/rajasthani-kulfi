const mongoose = require('mongoose');

const businessInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  gstin: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('BusinessInfo', businessInfoSchema); 