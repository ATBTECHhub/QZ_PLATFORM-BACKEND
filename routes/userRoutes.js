const express = require("express");
const router = express.Router();
const { 
    getUsers, 
    createUser, 
    createUsersFromCSV, 
    getUser, 
    updateUser, 
    deleteUser } = require("../controllers/userController");
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

//add a user
router.route('/').post(createUser);

//upload users from CSV
router.post('/upload', upload.single('file'), createUsersFromCSV);

//get all users
router.route('/').get(getUsers);

//get a user by id
router.route('/:userId').get(getUser);

//Update a user by id
router.route('/:userId').put(updateUser);

//Update a user by id
router.route('/:userId').delete(deleteUser);

module.exports = router;