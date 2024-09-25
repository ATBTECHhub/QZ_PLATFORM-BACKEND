const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../utils/sendEmail');
const User = require('../models/Users'); 
require("dotenv").config();

//@Desc Registration for users
//@Route POST /api/auths/register
//@Access Public
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

        //Create a new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });
        const firstName = user.name.split(' ')[0];

        await sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Welcome to QzPlatform!',
            html: `
                <p>Dear ${firstName},</p>
        
                <p>Welcome to QzPlatform! We are thrilled to have you join our community as a ${user.role}. Your registration was successful, and you are now ready to explore all the features and tools we offer to help you create engaging and effective assessments.</p>
        
                <p>To get started, please log in to your account using your registered email address. We encourage you to take a moment to familiarize yourself with the platform, set up your profile, and begin creating your first test.</p>
        
                <p>If you have any questions or need assistance, our support team is here to help. Do not hesitate to reach out to us at any time.</p>
        
                <p>Thank you for choosing QzPlatform. We look forward to supporting you on your journey to create impactful assessments!</p>
        
                <p>Best regards,<br>
                <strong>The QzPlatform Team</strong></p>
            `
        });
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//@Desc  Login 
//@Route POST /api/auths/login
//@Access Public
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

        // Send the token and firstname in the response
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
        //const resetPasswordUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;
        const resetPasswordUrl = `https://qzplatform.com/reset-password/${resetToken}`;
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
            html: `
                <p>Dear ${firstName},</p>
        
                <p>We received a request to reset the password for your account on QzPlatform. To proceed with the password reset, please click the link below:</p>
        
                <p><a href="${resetPasswordUrl}" target="_blank">${resetPasswordUrl}</a></p>
        
                <p>If you did not request a password reset, please disregard this email. Your account security is important to us, and no changes will be made without your confirmation.</p>
        
                <p>If you have any questions or need further assistance, feel free to contact our support team.</p>
        
                <p>Thank you,<br>
                <strong>The QzPlatform Team</strong></p>
            `
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
        const user = await User.findOne({ resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
         });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
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
