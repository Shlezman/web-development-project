const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant'); // Ensure correct model import
const auth = require('../middleware/auth');
const User = require('../models/User');  // Make sure to import the User model
const adminAuth = require('../middleware/adminAuth');
const asyncHandler = require('../utils/asyncHandler');
const { check, validationResult, query } = require('express-validator');

// Get plants (all for admin, user's plants for regular users)
router.get('/', auth, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    let query = {};

    // If not admin, only show user's plants
    if (!user.isAdmin) {
        query.seller = user.id;
    }
    // If admin, query remains empty, showing all plants

    const plants = await Plant.find(query).populate('seller', 'username');
    res.json(plants);
}));

// Create a new plant
router.post('/', [
    auth,
    check('name', 'Plant name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price must be a positive number').isFloat({ min: 0 }),
    check('category', 'Category is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description, price, category, originCountry, indoor  } = req.body;
        const newPlant = new Plant({
            name,
            description,
            price,
            category,
            seller: req.user.id,
            originCountry,
            indoor
        });
        const plant = await newPlant.save();
        res.status(201).json(plant);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete a plant
router.delete('/:plantId', auth, asyncHandler(async (req, res) => {
    const plantId = req.params.plantId;

    // Fetch the user from the database
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }

    // Find the plant
    const plant = await Plant.findById(plantId);
    if (!plant) {
        return res.status(404).json({ msg: 'Plant not found' });
    }

    // Check if user is the seller or an admin
    if (plant.seller.toString() !== user.id && !user.isAdmin) {
        return res.status(403).json({ msg: 'Not authorized to delete this plant' });
    }

    // Delete the plant
    await Plant.findByIdAndDelete(plantId);

    res.json({ msg: 'Plant deleted successfully' });
}));


// Search plants
router.get('/search', [
    query('q').optional().isString(),
    query('category').optional().isString(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('sort').optional().isIn(['price_asc', 'price_desc', 'newest']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { q, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    let searchQuery = {}; // Renamed to avoid conflict

    // Text search
    if (q) {
        searchQuery.$text = { $search: q };
    }

    // Category filter
    if (category) {
        searchQuery.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
        searchQuery.price = {};
        if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
        if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    let sortOption = {};
    if (sort) {
        switch (sort) {
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            default:
                sortOption = { createdAt: -1 }; // Default sort
        }
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: { path: 'seller', select: 'username' },
        sort: sortOption
    };

    try {
        const result = await Plant.paginate(searchQuery, options);
        res.json({
            plants: result.docs,
            currentPage: result.page,
            totalPages: result.totalPages,
            totalPlants: result.totalDocs
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}));

module.exports = router;
