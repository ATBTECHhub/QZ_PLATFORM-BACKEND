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
const updateGroupTemplate = (name, groupName,email, randomPassword) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <!-- Banner -->
        ${banner()}

        <!-- Email Body -->
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${header('Welcome to QzPlatform!')}
           <p>Dear ${name},</p>

                    <p>We are pleased to inform you that you have been added to the group "<strong>${groupName}</strong>" on QzPlatform. As part of this group, you will have access to various courses and assessments designed to enhance your learning experience.</p>

                    <p>Your temporary login credentials are as follows:</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> ${randomPassword}</p>

                    <p>Please log in to your account using these credentials. For security reasons, we strongly recommend that you change your password immediately after logging in.</p>

                    <p>If you have any questions or require assistance, please do not hesitate to contact our support team.</p>

                    <p>Thank you for being a part of our learning community. We wish you the best in your educational journey.</p>

                    <p>Best regards,<br>
                    <strong>The QzPlatform Team</strong></p>

        <!-- Footer -->
        ${footer()}
    </div>
`;

//Create Group Mail Template
const createGroupTemplate = (name, groupName, email, randomPassword) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <!-- Banner -->
        ${banner()}

        <!-- Email Body -->
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${header('Welcome to QzPlatform!')}
            <p>Dear ${name},</p>

                    <p>We are pleased to inform you that you have been added to the group "<strong>${groupName}</strong>" on QzPlatform. As part of this group, you will have access to various courses and assessments designed to enhance your learning experience.</p>

                    <p>Your temporary login credentials are as follows:</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> ${randomPassword}</p>

                    <p>Please log in to your account using these credentials. For security reasons, we strongly recommend that you change your password immediately after logging in.</p>

                    <p>If you have any questions or require assistance, please do not hesitate to contact our support team.</p>

                    <p>Thank you for being a part of our learning community. We wish you the best in your educational journey.</p>

                    <p>Best regards,<br>
                    <strong>The QzPlatform Team</strong></p>
        <!-- Footer -->
        ${footer()}
    </div>
`;



module.exports = {
    createGroupTemplate,
    updateGroupTemplate
};