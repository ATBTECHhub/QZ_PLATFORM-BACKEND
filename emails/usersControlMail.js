// Reusable banner, header, and footer functions

const banner = () => `
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dkceyr7qe/image/upload/v1729232379/mailbanner_impl0x.png" alt="QzPlatform" style="width: 100%; max-width: 600px;">
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

//User Creation Mail Template
const userCreationMailTemplate = (name, randomPassword) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <!-- Banner -->
        ${banner()}

        <!-- Email Body -->
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${header('Welcome to QzPlatform!')}
            <p>Dear ${name},</p>

            <p>Welcome to <strong>QzPlatform</strong>! Your account has been successfully created. To log in, please use the following temporary password:</p>

            <p style="text-align: center; margin: 20px 0;">
                <strong>Temporary Password:</strong> <code>${randomPassword}</code>
            </p>

            <p>We recommend changing your password immediately after logging in. If you need any assistance, feel free to contact our support team.</p>

            <p>Thank you for joining QzPlatform!</p>
            <p>Best regards,<br><strong>The QzPlatform Team</strong></p>
        </div>

        <!-- Footer -->
        ${footer()}
    </div>
`;

//User Creation Using CSV Mail Template
const csvUserCreationMailTemplate = (name, randomPassword) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <!-- Banner -->
        ${banner()}

        <!-- Email Body -->
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${header('Welcome to QzPlatform!')}
            <p>Dear ${name},</p>

            <p>Your account has been successfully created through the bulk user upload. Below is your temporary password:</p>

            <p style="text-align: center; margin: 20px 0;">
                <strong>Temporary Password:</strong> <code>${randomPassword}</code>
            </p>

            <p>We recommend changing your password after logging in. If you require any assistance, please contact our support team.</p>

            <p>Best regards,<br><strong>The QzPlatform Team</strong></p>
        </div>

        <!-- Footer -->
        ${footer()}
    </div>
`;


// User Update Mail Template
const userUpdateMailTemplate = (name) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <!-- Banner -->
        ${banner()}

        <!-- Email Body -->
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${header('Your QzPlatform Account Has Been Updated')}
            <p>Dear ${name},</p>

            <p>Your QzPlatform account details have been successfully updated. If you did not make this change or feel something is wrong, please contact our support team immediately.</p>

            <p>Best regards,<br><strong>The QzPlatform Team</strong></p>
        </div>

        <!-- Footer -->
        ${footer()}
    </div>
`;

module.exports = {
    userCreationMailTemplate,
    csvUserCreationMailTemplate,
    userUpdateMailTemplate
};
