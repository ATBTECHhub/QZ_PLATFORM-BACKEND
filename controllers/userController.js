const asyncHandler = require("express-async-handler");
const { sendMail } = require("../utils/sendEmail");
const User = require("../models/Users");
const bcrypt = require('bcryptjs');
const generateRandomPassword = require("../utils/generatePassword");
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

// @desc Create User
// @route POST /api/users
// @access protected (Test Creator Only)
const createUser = asyncHandler(async (req, res) => {
    const { name, email, role } = req.body;

    // Check if the logged-in user is a Test Creator
    if (req.user.role !== 'testCreator') {
        res.status(403);
        throw new Error("Only Test Creators can create users");
    }

    // Validation
    if (!name || !email) {
        res.status(400);
        throw new Error("Name and email are mandatory");
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Generate a random password
    const randomPassword = generateRandomPassword(); // Generates a random 16-character hex password

    // Hash the generated password before saving
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create user with the logged-in Test Creator as the 'createdBy'
    const user = await User.create({
        name,
        email,
        password: hashedPassword, // Save hashed password
        role,
        createdBy: req.user._id
    });
    console.log('CreatedBy:', req.user._id);

    if (user) {
        res.status(201).json({
            message: "User Successfully Created",
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdBy: req.user._id
        });

        // Send email notification with generated password
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Welcome to QzPlatform!',
            html: userCreationMailTemplate(name, randomPassword)
        };

        await sendMail(mailOptions); // Send the email
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc Create Users from CSV
// @route POST /api/users/upload
// @access protected (Test Creator Only)
const createUsersFromCSV = asyncHandler(async (req, res) => {
    if (req.user.role !== 'testCreator') {
        res.status(403);
        throw new Error("Only Test Creators can upload users");
    }

    if (!req.file) {
        res.status(400);
        throw new Error("Please upload a CSV file");
    }

    if (req.file.mimetype !== 'text/csv') {
        res.status(400);
        throw new Error("Invalid file format. Please upload a CSV file.");
    }

    const results = [];
    const filePath = path.join(__dirname, '../uploads', req.file.filename);

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const createdUsers = [];
            const errors = [];

            for (let row of results) {
                const { name, email, role } = row;

                if (!name || !email) {
                    errors.push({ email, message: "Name and email are mandatory" });
                    continue;
                }

                const userExists = await User.findOne({ email });
                if (userExists) {
                    errors.push({ email, message: "User already exists" });
                    continue;
                }

                const randomPassword = generateRandomPassword();
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                try {
                    const user = await User.create({
                        name,
                        email,
                        password: hashedPassword,
                        role,
                        createdBy: req.user._id
                    });

                    createdUsers.push(user);

                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: email,
                        subject: 'Welcome to QzPlatform!',
                        html: csvUserCreationMailTemplate(name, randomPassword)
                    };

                    await sendMail(mailOptions);
                } catch (err) {
                    errors.push({ email, message: `Error creating user: ${err.message}` });
                }
            }

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });

            res.status(201).json({
                message: "Users created successfully from CSV",
                createdUsers,
                errors
            });
        })
        .on('error', (err) => {
            res.status(500);
            throw new Error(`Error processing CSV file: ${err.message}`);
        });
});

// @desc Get all testTaker Users created by the current Test Creator
// @route GET /api/users
// @access protected (Test Creators Only)
const getUsers = asyncHandler(async (req, res) => {
    // Check if the logged-in user is a Test Creator
    if (req.user.role !== 'testCreator') {
        return res.status(403).json({ message: 'Access restricted to Test Creators only' });
    }

    // Retrieve only 'testTaker' users created by the logged-in Test Creator
    const users = await User.find({ 
        createdBy: req.user._id,  // Ensure the 'createdBy' field matches the logged-in Test Creator's _id
        role: 'testTaker' // Ensure only testTakers are returned
    });

    if (users && users.length > 0) {
        res.status(200).json(users);
    } else {
        res.status(404).json({ message: "No test takers found for this Test Creator" });
    }
});

// @desc Get a User by ID
// @route GET /api/users/:userId
// @access public
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error(`User not found with ID: ${req.params.userId}`);
    }
});

// @desc Update User
// @route PUT /api/users/:userId
// @access public
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

        const updatedUser = await user.save();

        res.json({
            message: "User Updated Successfully",
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: updatedUser.email,
            subject: 'Your QzPlatform Account Has Been Updated',
            html: userUpdateMailTemplate(updatedUser.name)
        };

        await sendMail(mailOptions);
    } else {
        res.status(404);
        throw new Error(`User not found with ID: ${req.params.userId}`);
    }
});

// @desc Delete User
// @route DELETE /api/users/:userId
// @access public
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (user) {
        await User.findByIdAndDelete(req.params.userId);
        res.json({ message: "User removed successfully" });
    } else {
        res.status(404);
        throw new Error(`User not found with ID: ${req.params.userId}`);
    }
});

module.exports = {
    createUser,
    createUsersFromCSV,
    getUsers,
    getUser,
    updateUser,
    deleteUser
};
