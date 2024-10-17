const asyncHandler = require("express-async-handler");
const { sendMail } = require("../utils/sendEmail");
const User = require("../models/Users");
const bcrypt = require('bcryptjs');
const generateRandomPassword = require("../utils/generatePassword");
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');


//@desc Create User
//@route POST /api/users
//@access public
const createUser = asyncHandler(async (req, res) => {
    const { name, email, role } = req.body;

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

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword, // Save hashed password
        role
    });

    if (user) {
        res.status(201).json({
            message: "User Successfully Created",
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

        // Send email notification with generated password
       const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Welcome to QzPlatform!',
    html: `
        <p>Dear ${name},</p>

        <p>Welcome to <strong>QzPlatform</strong>!</p>

        <p>Your account has been successfully created. To get started, please log in using the temporary password provided below. For your security, we recommend that you change this password immediately after your first login.</p>

        <p><strong>Temporary Password:</strong> <code>${randomPassword}</code></p>

        <p>If you have any questions or need assistance, please do not hesitate to contact our support team.</p>

        <p>We are excited to have you on board and look forward to helping you achieve your assessment goals.</p>

        <p>Best regards,<br>
        <strong>The QzPlatform Team</strong></p>
    `
};


        await sendMail(mailOptions);  // Await here if sendMail is asynchronous

    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

//@desc Create Users from CSV
//@route POST /api/users/upload
//@access public
const createUsersFromCSV = asyncHandler(async (req, res) => {
    // Check if a file is uploaded
    if (!req.file) {
        res.status(400);
        throw new Error("Please upload a CSV file");
    }

    // Validate if the uploaded file is of CSV type
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

                // Validation: Check if required fields are present
                if (!name || !email) {
                    errors.push({ email, message: "Name and email are mandatory" });
                    continue;
                }

                // Check if user already exists
                const userExists = await User.findOne({ email });
                if (userExists) {
                    errors.push({ email, message: "User already exists" });
                    continue;
                }

                // Generate a random password and hash it
                const randomPassword = generateRandomPassword();
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                // Create the user
                try {
                    const user = await User.create({
                        name,
                        email,
                        password: hashedPassword,
                        role
                    });

                    createdUsers.push(user);

                    // Send email notification with the generated password
                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: email,
                        subject: 'Welcome to QzPlatform!',
                        html: `
                            <p>Dear ${name},</p>
                            <p>Welcome to <strong>QzPlatform</strong>!</p>
                            <p>Your account has been successfully created. To get started, please log in using the temporary password provided below. For your security, we recommend that you change this password immediately after your first login.</p>
                            <p><strong>Temporary Password:</strong> <code>${randomPassword}</code></p>
                            <p>If you have any questions or need assistance, please do not hesitate to contact our support team.</p>
                            <p>Best regards,<br><strong>The QzPlatform Team</strong></p>
                        `
                    };

                    await sendMail(mailOptions);
                } catch (err) {
                    errors.push({ email, message: `Error creating user: ${err.message}` });
                }
            }

            // Clean up: Delete the uploaded CSV file after processing
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });

            // Respond with the result
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



//@desc Get all Users
//@route GET /api/users
//@access public
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

//@desc Get a User
//@route GET /api/users/:userId
//@access public
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error(`User not found with ID: ${req.params.userId}`);
    }
});

//@desc Update User
//@route PUT /api/users/:userId
//@access public
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

        // Send email notification
       const mailOptions = {
    from: process.env.EMAIL,
    to: updatedUser.email,
    subject: 'Your QzPlatform Account Has Been Updated',
    html: `
        <p>Dear ${updatedUser.name},</p>

        <p>We wanted to inform you that your QzPlatform account has been <strong>successfully updated</strong>.</p>

        <p>If you did not request this change or believe this update was made in error, please contact our support team immediately.</p>

        <p>If you have any questions or need further assistance, feel free to reach out. We’re here to help!</p>

        <p>Thank you for being a valued member of our community.</p>

        <p>Best regards,<br>
        <strong>The QzPlatform Team</strong></p>
    `
};


        await sendMail(mailOptions);  // Await here if sendMail is asynchronous

    } else {
        res.status(404);
        throw new Error(`User not found with ID: ${req.params.userId}`);
    }
});

//@desc Delete User
//@route DELETE /api/users/:userId
//@access public
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
