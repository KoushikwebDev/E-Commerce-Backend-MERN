const nodemailer = require("nodemailer");
const config = require("../config/index");

const mailHelper = async (options) => {
  let transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    // secure: false, // true for 465, false for other ports
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });

  const message = {
    from: "koushikwedevv@gmail.com", // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };
  // send mail with defined transport object
  await transporter.sendMail(message);
};

module.exports = mailHelper;
