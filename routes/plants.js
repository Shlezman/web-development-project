const express = require('express');
const router = express.Router();
const Plant = require('../models/plant'); // Ensure correct model import
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { check, validationResult, query } = require('express-validator');

// Get all plants
router.get('/', asyncHandler(async (req, res) => {
    try {
        const plants = await Plant.find().populate('seller', 'username');
        res.json(plants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
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
