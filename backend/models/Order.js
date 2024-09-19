const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plants: [{
        plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true } // Store the price at the time of adding to cart
    }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['cart', 'pending', 'paid', 'shipped', 'delivered'],
        default: 'cart'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Add index for buyer and status
orderSchema.index({ buyer: 1, status: 1 });

// Add the pagination plugin
orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order', orderSchema);