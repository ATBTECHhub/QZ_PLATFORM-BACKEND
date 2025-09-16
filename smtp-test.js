// smtp-test.js
import dotenv from "dotenv";
import path from "path";
import SibApiV3Sdk from "sib-api-v3-sdk";

// Load correct env file (development or production)
dotenv.config({ path: path.resolve(process.cwd(), ".env.development") });

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.error("❌ Missing BREVO_API_KEY in .env.development");
  process.exit(1);
}

// Configure Brevo
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKeyAuth = defaultClient.authentications["api-key"];
apiKeyAuth.apiKey = apiKey;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let sendSmtpEmail = {
  sender: { email: "qzplatform@gmail.com", name: "QzPlatform" }, // must be verified sender in Brevo
  to: [{ email: "yourpersonal@email.com", name: "Test User" }],
  subject: "✅ Test Email from Brevo API",
  htmlContent: "<h1>Hello 🚀</h1><p>This is a test email using Brevo API</p>",
};

apiInstance.sendTransacEmail(sendSmtpEmail).then(
  (data) => {
    console.log("✅ Email sent successfully:", data);
  },
  (error) => {
    console.error("❌ Failed to send email:", error.response?.body || error);
  }
);
