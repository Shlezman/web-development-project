const User = require('../models/User');

module.exports = async function(req, res, next) {
    try {
        // Fetch the user by ID and check for admin status
        const user = await User.findById(req.user.id);

        // If user does not exist or is not an admin, deny access
        if (!user || !user.isAdmin) {
            return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
        }
        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // Log the error and respond with server error status
        console.error(err.message);
        res.status(500).send('Server error');
    }
};