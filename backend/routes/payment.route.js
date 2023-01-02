const express = require("express");
const {
  sendStripeKey,
  sendRazorpayKey,
  captureStripePayment,
  captureRazorPayPament,
} = require("../controller/payment.controller");

const Router = express.Router();

const { isLoggedIn, customRole } = require("../middleware/user.middleware");

Router.get("/stripekey", isLoggedIn, sendStripeKey);
Router.get("/razorpaykey", isLoggedIn, sendRazorpayKey);

Router.get("/stripepayment", isLoggedIn, captureStripePayment);
Router.get("/razorpaypayment", isLoggedIn, captureRazorPayPament);

module.exports = Router;
