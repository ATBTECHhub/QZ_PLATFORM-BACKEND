import nodemailer from 'nodemailer';
require('dotenv').config();
import settings from './settings';

const transporter = nodemailer.createTransport({
  host: settings.SMTP_HOST,
  port: settings.SMTP_PORT,
  secure: false,
  requireTLS: true,
  auth: {
    user: settings.USER_EMAIL, // Your email address
    pass: settings.SMTP_PASSWORD, // Your email password
  },
  logger: true,
  debug: true,
});

export default transporter;
