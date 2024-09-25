const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const protect = async (req, res, next) => {
    let token;

    // Check for the token in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from the header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by ID, excluding password from the result
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Proceed to the next middleware
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // No token provided
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = protect;