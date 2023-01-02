const dotenv = require("dotenv");
dotenv.config();

const config = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  MONGO_URI: process.env.MONGO_URI,

  HOST: process.env.HOST,

  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

  RAZORPAT_API_KEY: process.env.RAZORPAY_API_KEY,
  RAZORPAY_SECRET_KEY: process.env.RAZORPAY_SECRET_KEY,
};

module.exports = config;
