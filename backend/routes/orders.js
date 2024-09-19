const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const {check, validationResult, query } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const Plant = require("../models/Plant");

// Create a new order
router.post('/', [
    auth,
    check('plants', 'Plants are required').isArray({ min: 1 }),
    check('plants.*.plant', 'Plant ID is required').isMongoId(),
    check('plants.*.quantity', 'Quantity must be a positive integer').isInt({ min: 1 })
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { plants } = req.body;

    try {
        // Fetch all plant details and calculate total amount
        const plantsWithDetails = await Promise.all(plants.map(async (item) => {
            const plant = await Plant.findById(item.plant);
            if (!plant) {
                throw new Error(`Plant with id ${item.plant} not found`);
            }
            return {
                plant: plant._id,
                quantity: item.quantity,
                price: plant.price
            };
        }));

        const totalAmount = plantsWithDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = new Order({
            buyer: req.user.id,
            plants: plantsWithDetails,
            totalAmount
        });

        const order = await newOrder.save();
        res.status(201).json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
}));

// Get orders (all for admin, user's orders for regular users)
router.get('/', [
    auth,
    query('status').optional().isIn(['cart', 'pending', 'paid', 'shipped', 'delivered']),
    query('minAmount').optional().isFloat({ min: 0 }),
    query('maxAmount').optional().isFloat({ min: 0 }),
    query('buyerUsername').optional().isString(),
    query('sort').optional().isIn(['createdAt_asc', 'createdAt_desc', 'totalAmount_asc', 'totalAmount_desc']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    let query = {};

    // If not admin, only show user's orders
    if (!user.isAdmin) {
        query.buyer = user.id;
    }

    const { status, minAmount, maxAmount, buyerUsername, sort, page = 1, limit = 10 } = req.query;

    if (status) {
        query.status = status;
    }

    if (minAmount || maxAmount) {
        query.totalAmount = {};
        if (minAmount) query.totalAmount.$gte = parseFloat(minAmount);
        if (maxAmount) query.totalAmount.$lte = parseFloat(maxAmount);
    }

    if (buyerUsername) {
        const buyer = await User.findOne({ username: buyerUsername });
        if (buyer) {
            query.buyer = buyer._id;
        } else {
            return res.status(404).json({ msg: 'Buyer not found' });
        }
    }

    let sortOption = {};
    if (sort) {
        switch (sort) {
            case 'createdAt_asc':
                sortOption = { createdAt: 1 };
                break;
            case 'createdAt_desc':
                sortOption = { createdAt: -1 };
                break;
            case 'totalAmount_asc':
                sortOption = { totalAmount: 1 };
                break;
            case 'totalAmount_desc':
                sortOption = { totalAmount: -1 };
                break;
        }
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sortOption,
        populate: [
            {
                path: 'buyer',
                select: 'username'
            },
            {
                path: 'plants.plant',
                populate: {
                    path: 'seller',
                    model: 'User',
                    select: 'username'
                }
            }
        ]
    };

    try {
        const result = await Order.paginate(query, options);
        res.json({
            orders: result.docs,
            currentPage: result.page,
            totalPages: result.totalPages,
            totalOrders: result.totalDocs
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}));

// Delete an order (admin only)
router.delete('/:orderId', auth, async (req, res) => {
    try {
        // Fetch the user from the database
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if user is an admin
        if (!user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized. Admin access required.' });
        }

        const orderId = req.params.orderId;

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Delete the order
        await Order.findByIdAndDelete(orderId);

        res.json({ msg: 'Order deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



// Update order
router.patch('/:orderId', [
    auth,
    check('plants', 'Plants must be an array').isArray(),
    check('plants.*.plant', 'Plant ID is required').isMongoId(),
    check('plants.*.quantity', 'Quantity must be a positive integer').isInt({ min: 1 }),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const orderId = req.params.orderId;
    const { plants } = req.body;

    // Fetch the user and order
    const user = await User.findById(req.user.id);
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user is the order creator or an admin
    if (!user.isAdmin && order.buyer.toString() !== user.id) {
        return res.status(403).json({ msg: 'Not authorized to update this order' });
    }

    // Only allow modifications if the order status is 'cart'
    if (order.status !== 'cart') {
        return res.status(400).json({ msg: 'Can only modify orders with status "cart"' });
    }

    // Validate and update each plant in the order
    const updatedPlants = await Promise.all(plants.map(async (plantItem) => {
        const plant = await Plant.findById(plantItem.plant);
        if (!plant) {
            throw new Error(`Plant with id ${plantItem.plant} not found`);
        }
        return {
            plant: plant._id,
            quantity: plantItem.quantity,
            price: plant.price // Use current price
        };
    }));

    order.plants = updatedPlants;

    // Calculate total amount
    order.totalAmount = updatedPlants.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Update the order
    await order.save();

    res.json({ msg: 'Order updated successfully', order: order });
}));
// Add more routes for updating order status, etc.

module.exports = router;