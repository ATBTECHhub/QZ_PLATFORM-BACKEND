const jwt = require('jsonwebtoken');
const User = require('../models/Users');

// Protect middleware to verify if user is logged in
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(404).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Role-based middleware for test creators only
const testCreatorOnly = (req, res, next) => {
    if (req.user.role !== 'testCreator') {
        return res.status(403).json({ message: 'Access restricted to Test Creators only' });
    }
    next();
};

module.exports = { protect, testCreatorOnly };
