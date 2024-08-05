const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Updated route to make a user an admin
router.put('/make-admin/:userId', auth, adminAuth, async (req, res) => {
    try {
        // Find the user to be made admin
        const userToUpdate = await User.findById(req.params.userId);
        if (!userToUpdate) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update the user to be an admin
        userToUpdate.isAdmin = true;
        await userToUpdate.save();

        res.json({ msg: 'User successfully made admin', user: userToUpdate });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// User registration and validation!
router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })

  ] ,async (req, res) => {

     // assure validations
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
    }
  
  try {
        try {
            const { username, email, password } = req.body;
            
            // Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
            return res.status(400).json({ msg: 'User already exists' });
            }

            // Create new user
            user = new User({ username, email, password});

            // Hash password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            // Save user to database
            await user.save();

            res.status(201).json({ msg: 'User registered successfully' });
            }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
        }
    }

    catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error', error: err.message });
  }


  
});

// User login
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Create and send JWT token
      const payload = {
        user: {
          id: user.id
        }
      };
  
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

// Add more routes (login, get user profile, etc.)

module.exports = router;