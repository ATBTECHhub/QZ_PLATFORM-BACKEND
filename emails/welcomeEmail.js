// Reusable banner, header, and footer functions

const banner = () => `
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="../uploads/mailbanner.png" alt="QzPlatform" style="width: 100%; max-width: 600px;">
    </div>
`;

const footer = () => `
    <div style="text-align: center; margin-top: 20px;">
        <p style="color: #999; font-size: 12px;">QzPlatform &copy; 2024 | All rights reserved</p>
    </div>
`;

const header = (title) => `
    <h2 style="color: #2d9cdb; text-align: center;">${title}</h2>
`;

// Registration email template
const registrationMailTemplate = (firstName, userRole) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <!-- Banner -->
        ${banner()}

        <!-- Email Body -->
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${header('Welcome to QzPlatform!')}
            <p>Dear ${firstName},</p>

            <p>We are thrilled to have you join our community as a <strong>${userRole}</strong>. Your registration was successful, and you are now ready to explore all the features and tools we offer to help you create engaging and effective assessments.</p>

            <p>To get started, please log in to your account using your registered email address. We encourage you to take a moment to familiarize yourself with the platform, set up your profile, and begin creating your first test.</p>

            <p>If you have any questions or need assistance, our support team is here to help. Do not hesitate to reach out to us at any time.</p>

            <p>Thank you for choosing QzPlatform. We look forward to supporting you on your journey to create impactful assessments!</p>

            <p>Best regards,<br>
            <strong>The QzPlatform Team</strong></p>
        </div>

        <!-- Footer -->
        ${footer()}
    </div>
`;

// Forgot password email template
const forgotPasswordMailTemplate = (firstName, resetPasswordUrl) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <!-- Banner -->
        ${banner()}

        <!-- Email Body -->
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${header('Password Reset Request')}
            <p>Dear ${firstName},</p>

            <p>We received a request to reset the password for your account on <strong>QzPlatform</strong>. To proceed with the password reset, please click the link below:</p>

            <p style="text-align: center; margin: 20px 0;">
                <a href="${resetPasswordUrl}" style="background-color: #2d9cdb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;" target="_blank">Reset Your Password</a>
            </p>

            <p>If you did not request a password reset, please disregard this email. Your account security is important to us, and no changes will be made without your confirmation.</p>

            <p>If you have any questions or need further assistance, feel free to contact our support team.</p>

            <p>Thank you,<br>
            <strong>The QzPlatform Team</strong></p>
        </div>

        <!-- Footer -->
        ${footer()}
    </div>
`;

module.exports = {
    registrationMailTemplate,
    forgotPasswordMailTemplate
};
