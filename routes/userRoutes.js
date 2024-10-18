const express = require("express");
const router = express.Router();
const { getUsers, createUser, createUsersFromCSV, getUser, updateUser, deleteUser } = require("../controllers/userController");
const { protect, testCreatorOnly } = require("../middlewares/authHandler"); // Import the middleware
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

// Use middleware in the routes where it's needed

// Add a user (no need for protect or testCreatorOnly)
router.route('/').post(createUser);

// Upload users from CSV (protected, restricted to Test Creators)
router.post('/upload', protect, testCreatorOnly, upload.single('file'), createUsersFromCSV);

// Get all users (protected and restricted to Test Creators)
router.route('/').get(protect, testCreatorOnly, getUsers);

// Get a user by ID (protected)
router.route('/:userId').get(protect, getUser);

// Update a user by ID (protected)
router.route('/:userId').put(protect, updateUser);

// Delete a user by ID (protected)
router.route('/:userId').delete(protect, deleteUser);

module.exports = router;
