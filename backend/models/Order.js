const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Define the Order schema structure
const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plants: [{
        plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['cart', 'delivered'],
        default: 'cart'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries by buyer and status
orderSchema.index({ buyer: 1, status: 1 });

// Add pagination functionality to the schema
orderSchema.plugin(mongoosePaginate);

// Static method to calculate total of delivered orders for a user
orderSchema.statics.calculateTotalDelivered = async function (buyerId) {
    try {
        // Ensure buyerId is an ObjectId
        const validBuyerId = typeof buyerId === 'string' ? new mongoose.Types.ObjectId(buyerId) : buyerId;

        const result = await this.aggregate([
            { $match: { buyer: validBuyerId, status: 'delivered' } },
            {
                $group: {
                    _id: "$buyer",
                    totalDeliveredAmount: { $sum: "$totalAmount" }
                }
            }
        ]);

        return result.length > 0 ? result[0].totalDeliveredAmount : 0;
    } catch (error) {
        console.error("Error in calculateTotalDelivered:", error.message);
        throw error;
    }
};

module.exports = mongoose.model('Order', orderSchema);
