const express = require("express");
const router = express.Router();
const { 
    getUsers, 
    createUser, 
    createUsersFromCSV, 
    getUser, 
    updateUser, 
    deleteUser 
} = require("../controllers/userController");
const { authenticateToken, authorizeRoles } = require("../middlewares/authHandler"); // Import updated middlewares
const multer = require('multer');
const path = require('path');

// Configure multer to store uploaded files in 'uploads' folder with original name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// File filter for validating file type
const csvFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.csv') {
        return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: csvFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// Use the new middlewares in the routes where they are needed

// Add a user (only accessible to authenticated Test Creators)
router.route('/')
    .post(authenticateToken, authorizeRoles('testCreator'), createUser);

// Upload users from CSV (protected, restricted to Test Creators)
router.post('/upload', 
    authenticateToken, 
    authorizeRoles('testCreator'), 
    upload.single('file'), 
    createUsersFromCSV
);

// Get all users (protected and restricted to Test Creators)
router.route('/')
    .get(authenticateToken, authorizeRoles('testCreator'), getUsers);

// Get a user by ID (accessible to all authenticated users)
router.route('/:userId')
    .get(authenticateToken, getUser);

// Update a user by ID (accessible to all authenticated users)
router.route('/:userId')
    .put(authenticateToken, updateUser);

// Delete a user by ID (accessible to all authenticated users)
router.route('/:userId')
    .delete(authenticateToken, deleteUser);

module.exports = router;
