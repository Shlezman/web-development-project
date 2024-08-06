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
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

// Add index for buyer and status
orderSchema.index({ buyer: 1, status: 1 });

// Add the pagination plugin
orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order', orderSchema);