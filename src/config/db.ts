const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      ssl: false, // Enable SSL
      tls: false, // Enable TLS
      tlsAllowInvalidCertificates: false, // Allow invalid certificates (use with caution in development)
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    console.log('MongoDB connected');
  } catch (error: any) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
