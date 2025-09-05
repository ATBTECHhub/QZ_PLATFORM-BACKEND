const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { registrationMailTemplate, forgotPasswordMailTemplate } = require('../emails/welcomeEmail');
const { sendMail } = require('../utils/sendEmail');
const User = require('../models/Users');
require("dotenv").config();

// @Desc Registration for users
// @Route POST /api/auths/register
// @Access Public
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        const firstName = user.name.split(' ')[0];

        // Send registration email
        await sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Welcome to QzPlatform!',
            html: registrationMailTemplate(firstName, user.role),
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @Desc  Login 
// @Route POST /api/auths/login
// @Access Public
const login = async (req, res) => {
    try {
        const { email, password, role, keepMeSignedIn } = req.body;

        // Find the user by email and role
        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the user is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'You have been deactivated, contact administrator' });
        }

        // Compare the entered password with the stored password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a token with the user's id and role
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            {
                expiresIn: keepMeSignedIn ? '7d' : '1h'
            }
        );

        // Send the token and first name in the response
        res.status(200).json({
            token,
            firstname: user.name.split(' ')[0] // Include the user's first name
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always return success message for security reasons instead of user email not found
        if (!user) {
            return res.status(200).json({ message: 'Reset password link sent' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordUrl = `https://qzplatform.vercel.app/change-password/${resetToken}`;
        console.log("Generated Reset URL:", resetPasswordUrl);

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const firstName = user.name.split(' ')[0];

        // Send reset password email
        await sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Password Reset Request - QzPlatform',
            html: forgotPasswordMailTemplate(firstName, resetPasswordUrl),
        });

        res.status(200).json({ message: 'Reset password link sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const { token } = req.params; // Get token from URL parameters

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Find user by reset token without checking for expiration
        const user = await User.findOne({ 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update the user's password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Exporting the functions
module.exports = {
    register,
    login,
    forgotPassword,
    changePassword
};
