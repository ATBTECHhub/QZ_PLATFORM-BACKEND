import dotenv from 'dotenv';
import { cleanEnv, str, port, bool } from 'envalid';

// Just load the base .env file - Render will handle environment variables
dotenv.config();

const settings = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  NODE_ENV: str({ 
    choices: ['development', 'production', 'test'],
    default: 'production' // ← Default to production for safety
  }),
  RENDER: bool({ default: false }), // ← Default false, set to true on Render
  MONGO_URI: str(),
  SMTP_HOST: str(),
  SMTP_PORT: port(),
  USER_EMAIL: str(),
  SMTP_PASSWORD: str(),
  BREVO_API_KEY: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES: str(),
  BASE_URL: str(),
  FRONTEND_URL: str()
});

console.log(`✅ Environment: ${settings.NODE_ENV}`);
console.log(`🌐 Running on Render: ${settings.RENDER}`);
console.log(`🚀 Server starting on port: ${settings.PORT}`);

export default settings;