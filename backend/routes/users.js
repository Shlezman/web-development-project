const express = require('express');
const router = express.Router();
const User = require('../models/User');
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

// Delete a user (admin only)
router.delete('/:userId', auth, async (req, res) => {
    try {
        // Fetch the current user (admin) from the database
        const adminUser = await User.findById(req.user.id);
        if (!adminUser) {
            return res.status(404).json({ msg: 'Admin user not found' });
        }

        // Check if the current user is an admin
        if (!adminUser.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized. Admin access required.' });
        }

        const userIdToDelete = req.params.userId;

        // Prevent admin from deleting themselves
        if (userIdToDelete === adminUser.id) {
            return res.status(400).json({ msg: 'Admin cannot delete their own account' });
        }

        // Find the user to delete
        const userToDelete = await User.findById(userIdToDelete);
        if (!userToDelete) {
            return res.status(404).json({ msg: 'User to delete not found' });
        }

        // Delete the user
        await User.findByIdAndDelete(userIdToDelete);

        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all users (admin only)
router.get('/all', auth, async (req, res) => {
    try {
        // Fetch the current user (admin) from the database
        const adminUser = await User.findById(req.user.id);
        if (!adminUser) {
            return res.status(404).json({ msg: 'Admin user not found' });
        }

        // Check if the current user is an admin
        if (!adminUser.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized. Admin access required.' });
        }

        // Fetch all users
        const users = await User.find().select('-password'); // Exclude password field

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Add more routes (login, get user profile, etc.)

module.exports = router;