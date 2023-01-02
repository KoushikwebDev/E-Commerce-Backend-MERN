const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/index");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      tolowercase: true,
      maxlength: [20, "Name Char Should be within 20 Charcters"],
    },

    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, "Please Enter Current Format."],
      unique: true,
      tolowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password Should be atleast Six Charecter."],
      select: false,
    },
    role: {
      type: String,
      default: "user",
    },
    photo: {
      id: {
        type: String,
        // required: true,
      },
      secure_url: {
        type: String,
        // required: true,
      },
    },

    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt Password Before Save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods = {
  // validate password  with passed on user password
  isValidatedPassword: async function (userSendPassword) {
    return await bcrypt.compare(userSendPassword, this.password); // it gives true/false
  },

  // create and return JWT token
  getJwtToken: function () {
    return JWT.sign({ id: this._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRY,
    });
  },

  //   generate ForgotPassword Token
  getForgotPasswordToken: function () {
    // generate long and random string
    const forgotToken = crypto.randomBytes(20).toString("hex");

    // getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(forgotToken)
      .digest("hex");

    // time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

    return forgotToken;
  },
};

module.exports = mongoose.model("User", userSchema);
