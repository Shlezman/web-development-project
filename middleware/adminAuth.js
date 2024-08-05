const User = require('../models/user');

module.exports = async function(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};