const asyncHandler = require("../middleware/bigPromise");
const customError = require("../utils/customError");
const Razorpay = require("razorpay");
const config = require("../config/index");
const stripe = require("stripe")(config.STRIPE_SECRET_KEY);

exports.sendStripeKey = asyncHandler(async (req, res) => {
  res.status(200).json({
    stripeKey: config.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = asyncHandler(async (req, res) => {
  // new method 😎
  //   const session = await stripe.checkout.sessions.create({
  //     line_items: [
  //       {
  //         price_data: {
  //           currency: "inr",
  //           product_data: { name: "T-shirt" },
  //           unit_amount: 2000,
  //         },
  //         quantity: 1,
  //       },
  //     ],
  //     mode: "payment",
  //     success_url: "http://localhost:4242/success.html",
  //     cancel_url: "http://localhost:4242/cancel.html",
  //   });

  //   old method 😎😎
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",

    // optional
    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
    amount,
  });
});

// RazorPay
exports.sendRazorpayKey = asyncHandler(async (req, res) => {
  res.status(200).json({
    razorPayKey: config.RAZORPAT_API_KEY,
  });
});

exports.captureRazorPayPament = asyncHandler(async (req, res) => {
  const amount = req.body.amount;
  //  const amount = 5000;
  // console.log(amount, typeof amount);
  let instance = new Razorpay({
    key_id: config.RAZORPAT_API_KEY,
    key_secret: config.RAZORPAY_SECRET_KEY,
  });

  let options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "receipt#1",
  };

  //   instance.orders.create(options,function(err,order){
  //     console.log(order);
  //   });

  const myOrder = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    amount,
    order: myOrder,
  });
});
