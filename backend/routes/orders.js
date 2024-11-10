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
        // Check if user already has a cart
        const existingCart = await Order.findOne({
            buyer: req.user.id,
            status: 'cart'
        });

        if (existingCart) {
            return res.status(400).json({
                msg: 'You already have an active cart. Please complete or update your existing cart.'
            });
        }

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
            totalAmount,
            status: 'cart'
        });

        const order = await newOrder.save();
        res.status(201).json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
}));

// Update order status to delivered
router.patch('/:orderId/status', [
    auth,
    check('status', 'Status must be delivered').equals('delivered')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const orderId = req.params.orderId;

    // Find the order and user
    const order = await Order.findById(orderId);
    const user = await User.findById(req.user.id);

    if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
    }

    // Check authorization
    if (order.buyer.toString() !== user.id) {
        return res.status(403).json({ msg: 'Not authorized to update this order' });
    }

    // Validate current status is cart
    if (order.status !== 'cart') {
        return res.status(400).json({
            msg: 'Only orders in cart status can be marked as delivered'
        });
    }

    // Update order
    order.status = 'delivered';
    order.deliveryDate = new Date();

    await order.save();

    res.json({
        msg: 'Order marked as delivered successfully',
        order
    });
}));

// Get orders (all for admin, user's orders for regular users)
router.get('/', [
    auth,
    query('status').optional().isIn(['cart', 'delivered']),
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
    const { status, minAmount, maxAmount, buyerUsername, sort, page = 1, limit = 10 } = req.query;

    // If not admin, only show user's orders
    // If admin and userId is provided in query, show that user's orders
    if (!user.isAdmin || user.isAdmin && !buyerUsername) {
        query.buyer = user.id;
    } else if (buyerUsername) {
        const buyer = await User.findOne({ username: buyerUsername });
        if (buyer) {
            query.buyer = buyer._id;
        } else {
            return res.status(404).json({ msg: `Buyer with username "${buyerUsername}" not found` });
        }
    }



    if (status) {
        query.status = status;
    }

    if (minAmount || maxAmount) {
        query.totalAmount = {};
        if (minAmount) query.totalAmount.$gte = parseFloat(minAmount);
        if (maxAmount) query.totalAmount.$lte = parseFloat(maxAmount);
    }


    let sortOption = { createdAt: -1 }; // Default sort by most recent
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
        console.error(`Failed to fetch orders: ${err.message}`);
        res.status(500).send('Server error');
    }
}));


// Update cart items
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

    // Check if user is the order creator
    if (order.buyer.toString() !== user.id) {
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
            price: plant.price
        };
    }));

    order.plants = updatedPlants;
    order.totalAmount = updatedPlants.reduce((total, item) => total + (item.price * item.quantity), 0);

    await order.save();

    res.json({ msg: 'Order updated successfully', order: order });
}));

// Get total of delivered orders
router.get('/total-delivered', [
    auth,
    query('buyerUsername').optional().isString()
], asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const { buyerUsername } = req.query;

    let buyerId;

    if (user.isAdmin && buyerUsername) {
        // Admin requesting for another user by username
        const buyer = await User.findOne({ username: buyerUsername });
        if (!buyer) {
            return res.status(404).json({ msg: `Buyer with username "${buyerUsername}" not found` });
        }
        buyerId = buyer._id;
    } else if (!user.isAdmin && buyerUsername) {
        // Non-admin users should not be able to request for other users
        return res.status(403).json({ msg: 'Not authorized' });
    } else {
        // If no buyerUsername is provided or the user is not an admin, use their own ID
        buyerId = req.user.id;
    }

    try {
        // Use the static method from Order model
        const totalDeliveredAmount = await Order.calculateTotalDelivered(buyerId);
        res.json({ totalDeliveredAmount });
    } catch (err) {
        console.error(`Failed to calculate total delivered amount: ${err.message}`);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
}));



module.exports = router;