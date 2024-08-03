const express = require('express');
const router = express.Router();
const Order = require('../web-development-project/models/order');
const auth = require('../web-development-project/middleware/auth');

// Create a new order
router.post('/', [
    auth,
    check('plants', 'Plants are required').isArray({ min: 1 }),
    check('plants.*.plants', 'Plant ID is required').not().isEmpty(),
    check('plants.*.quantity', 'Quantity must be a positive integer').isInt({ min: 1 }),
    check('totalAmount', 'Total amount must be a positive number').isFloat({ min: 0 })
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
        try {
            const { products, totalAmount } = req.body;
            const newOrder = new Order({
              buyer: req.user.id,
              products,
              totalAmount
            });
            const order = await newOrder.save();
            res.status(201).json(order);
          } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
          }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });


// Get user's orders
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).populate('products.product');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add more routes for updating order status, etc.

module.exports = router;