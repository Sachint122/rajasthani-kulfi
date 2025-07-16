const mongoose = require('mongoose');

const UserTransactionSchema = new mongoose.Schema({
  customerPhone: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('UserTransaction', UserTransactionSchema); 