const asyncHandler = require('express-async-handler');
const User = require('../models/Users');
const Group = require('../models/groups');
const Test = require('../models/tests');
const Admin = require('../models/admins');
const Question = require('../models/questions');
const PlatformAnalytics = require('../models/platformAnalytics');

//@Desc Register Super Admin
//@Route POST /api/superadmin/register
//@Access private (Super Admin Only)
const register = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        // Check if user already exists
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Admin.create({
            name,
            email,
            password: hashedPassword
        });
        const firstName = admin.name.split(' ')[0];

        await sendMail({
            from: process.env.EMAIL,
            to: admin.email,
            subject: 'Welcome to QzPlatform!',
            html: `
                <p>Dear ${firstName},</p>
        
                <p>Welcome to QzPlatform! We are thrilled to have you join our community as a Super Admin. Your registration was successful, and you are now ready to explore all the features and tools we offer to help you create engaging and effective assessments.</p>
        
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

//@Desc Login for Super Admin
//@Route POST /api/superadmin/login
//@Access private (Super Admin Only)
const login = async (req, res) => {
    try {
        const { email, password, keepMeSignedIn } = req.body;

        const admin = await Admin.findOne({ email, role });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
            expiresIn: keepMeSignedIn ? '7d' : '1h'
        });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        //const resetPasswordUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;
        const resetPasswordUrl = `https://qz-platform-backend-1.onrender.com/reset-password/${resetToken}`;
        console.log("Generated Reset URL:", resetPasswordUrl);


        // Assuming your User model has a resetPasswordToken and resetPasswordExpires fields
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await admin.save();
        const firstName = admin.name.split(' ')[0];

        // Send reset password email
        await sendMail({
            from: process.env.EMAIL,
            to: admin.email,
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

        // Find admin by reset token without checking for expiration
        const admin = await Admin.findOne({ resetPasswordToken: token });

        if (!admin) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Update the admin's password
        admin.password = await bcrypt.hash(newPassword, 10);
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//@Desc get qzplatform stats
//@Route GET /api/superadmin/stats
//@Access Private (Super Admin only)
const getPlatformStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalGroups = await Group.countDocuments();
    const totalTests = await Test.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const testTakers = await User.countDocuments({ role: 'testTaker' });
    const testCreators = await User.countDocuments({ role: 'testCreator' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const completedTests = await Test.countDocuments({ status: 'completed' });

    // Save analytics to the database
    const analytics = new PlatformAnalytics({
        totalUsers,
        totalGroups,
        totalTests,
        totalQuestions,
        activeUsers,
        inactiveUsers,
        completedTests,
        message: 'Analytics saved successfully'
    });
    await analytics.save();

    res.status(200).json({
        totalUsers,
        totalGroups,
        totalTests,
        totalQuestions,
        testTakers,
        testCreators,
        activeUsers,
        inactiveUsers,
        completedTests,
        message: 'Platform statistics retrieved successfully'
    });
});

//@Desc get all users with pagination
//@Route GET /api/superadmin/users
//@Access Private (Super Admin only)
const listAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .select('name email role isActive createdAt updatedAt _id')
        .skip(skip)
        .limit(limit);

    const formattedUsers = users.map(user => ({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.isActive ? 'Active' : 'Inactive', // Status based on isActive
        createdDate: user.createdAt.toISOString().split('T')[0], // Format created date
        modifiedDate: user.updatedAt.toISOString().split('T')[0], // Format modified date
        userId: user._id
    }));

    const totalUsers = await User.countDocuments();

    res.status(200).json({
        users: formattedUsers,
        page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers
    });
});


//@Desc Disable/enable user status
//@Route PUT /api/superadmin/users/:userId
//@Access Private (Super Admin only)
const toggleUserStatus = asyncHandler(async (req, res) => {
    const foundUser = await User.findById(req.params.userId);
    if (!foundUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    // // Check if requester is Super Admin
    // if (!req.user.isSuperAdmin) {
    //     return res.status(403).json({ message: 'You are not authorized to perform this action' });
    // }

    // Toggle user status
    foundUser.isActive = !foundUser.isActive;
    await foundUser.save();

    res.status(200).json({
        message: `User status updated successfully`,
        isActive: foundUser.isActive
    });
});

//@Desc monthly user registration stats
//@Route GET /api/superadmin/users/user-flow
//@Access Private (Super Admin only)
const getMonthlyUserFlow = asyncHandler(async (req, res) => {
    const currentYear = new Date().getFullYear();

    const userFlow = await User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(`${currentYear}-01-01`),
                    $lte: new Date(`${currentYear}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { month: { $month: '$createdAt' }, role: '$role' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.month': 1 }  // Sort by month
        }
    ]);

    res.status(200).json(userFlow);
});

module.exports = {
    register,
    login,
    forgotPassword,
    changePassword,
    getPlatformStats,
    listAllUsers,
    toggleUserStatus,
    getMonthlyUserFlow
};
