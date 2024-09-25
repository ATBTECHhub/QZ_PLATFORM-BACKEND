const express = require('express');
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    changePassword, 
    getPlatformStats,  
    listAllUsers, 
    toggleUserStatus, 
    getMonthlyUserFlow 
} = require('../controllers/superAdminController');

// Middleware for authentication and role checking
//const { protect, isAdmin } = require('../middlewares/authHandler');

// Route to register super admin
router.post('/register', getPlatformStats);

// Route to login super admin
router.post('/login', login);

// Route get reset password token for super Admin
router.post('/forgot-password', forgotPassword);

// Route to change or reset password for super Admin
router.post('/reset-password', changePassword);

// Route to Get platform statistics
router.get('/stats', getPlatformStats);

// Route to Get all users with pagination
router.get('/users', listAllUsers);

// Route to Toggle user status
router.put('/users/:userId', toggleUserStatus);

// Route to Get monthly user registration stats
router.get('/users/user-flow', getMonthlyUserFlow);

module.exports = router;
