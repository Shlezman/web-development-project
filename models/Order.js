const mongoose = require('mongoose');
const mongo = require("mongoose");


const orderSchema = new mongo.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
        },

  plants: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
  }],

  totalAmount: {
        type: Number, required: true },
        status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered'], default: 'pending' },
        createdAt: { type: Date, default: Date.now },
  // Add more fields as needed (e.g., shipping address, payment method)
});

module.exports = mongoose.model('Order', orderSchema);