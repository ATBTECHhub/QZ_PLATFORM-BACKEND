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

// Add a user (only accessible to authenticated Test Creators)
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Add a new user
 *     description: Adds a new user to the system, only accessible to authenticated Test Creators.
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User details to be added.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully.
 *       400:
 *         description: Invalid input.
 */
router.route('/')
    .post(authenticateToken, authorizeRoles('testCreator'), createUser);

// Upload users from CSV (protected, restricted to Test Creators)
/**
 * @swagger
 * /api/users/upload:
 *   post:
 *     summary: Upload users from CSV file
 *     description: Upload a CSV file containing users. Only accessible to Test Creators.
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Users uploaded successfully.
 *       400:
 *         description: Invalid file type or file size too large.
 */
router.post('/upload', 
    authenticateToken, 
    authorizeRoles('testCreator'), 
    upload.single('file'), 
    createUsersFromCSV
);

// Get all users (protected and restricted to Test Creators)
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users, only accessible to Test Creators.
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully.
 *       403:
 *         description: Forbidden. Only Test Creators are allowed to access this.
 */
router.route('/')
    .get(authenticateToken, authorizeRoles('testCreator'), getUsers);

// Get a user by ID (accessible to all authenticated users)
/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieves a single user by their unique ID. Accessible to all authenticated users.
 *     tags:
 *       - users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found successfully.
 *       404:
 *         description: User not found.
 */
router.route('/:userId')
    .get(authenticateToken, getUser);

// Update a user by ID (accessible to all authenticated users)
/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: Update a user by ID
 *     description: Updates the details of a user by their unique ID. Accessible to all authenticated users.
 *     tags:
 *       - users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: User details to update.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       400:
 *         description: Invalid input.
 */
router.route('/:userId')
    .put(authenticateToken, updateUser);

// Delete a user by ID (accessible to all authenticated users)
/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Deletes a user by their unique ID. Accessible to all authenticated users.
 *     tags:
 *       - users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 */
router.route('/:userId')
    .delete(authenticateToken, deleteUser);

module.exports = router;
