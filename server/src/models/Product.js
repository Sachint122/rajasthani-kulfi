const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['kulfi', 'ice-cream', 'special'], required: true },
    image: { type: String },
    isAvailable: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    ingredients: [String],
    allergens: [String],
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema); 