import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' }); // adjust if needed

type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail({ to, subject, html }: MailOptions) {
  try {
    // Configure Brevo client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY!;

    // Initialize API
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // Build the email
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;  // 👈 REQUIRED
    sendSmtpEmail.sender = { email: 'qzplatform@gmail.com', name: 'QzPlatform' };
    sendSmtpEmail.to = [{ email: to }];

    // Send
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Email failed:', error);
    throw error;
  }
}
