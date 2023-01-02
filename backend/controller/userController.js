const User = require("../model/user");
const asyncHandler = require("../middleware/bigPromise");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const mailHelper = require("../utils/emailHelper");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

exports.signUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!(name && email && password && req.files)) {
    throw new customError("All Fiels are Required", 400);
  }

  const exinstingUser = await User.findOne({ email });
  if (exinstingUser) {
    throw new customError("User Already Exists");
  }

  let result;
  if (req.files && !exinstingUser) {
    let userPhoto = req.files.photo;

    result = await cloudinary.uploader.upload(userPhoto.tempFilePath, {
      folder: "probackend",
      width: 150,
      crop: "scale",
      // transformation: {
      //   width: 150,
      // },
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result?.public_id,
      secure_url: result?.secure_url,
    },
  });
  cookieToken(user, res);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    throw new Error("All fields are Requires", 400);
  }

  const exinstingUser = await User.findOne({ email }).select("+password");

  if (!exinstingUser) {
    throw new Error("User Not found", 404);
  }

  const isPasswordCorrect = await exinstingUser.isValidatedPassword(password);
  // console.log(isPasswordCorrect);
  if (!isPasswordCorrect) {
    throw new Error("Password is Incorrect", 400);
  }

  cookieToken(exinstingUser, res);
});

exports.logout = asyncHandler(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    meaasge: "logout Success",
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new customError("Email is required", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new customError("User not found", 404);
  }

  const forgotToken = user.getForgotPasswordToken();
  user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `Click On this Url to reset your password \n\n ${resetUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: "KLO Store- password reset email",
      message,
    });
    res.status(200).json({
      success: true,
      message: "Reset password link send to the user",
    });
  } catch (error) {
    (user.forgotPasswordToken = undefined),
      (user.forgotPasswordExpiry = undefined);
    user.save({ validateBeforeSave: false });
    throw new Error(error);
  }
});

exports.passwordReset = asyncHandler(async (req, res) => {
  const token = req.params.token;
  const { password, confirmpassword } = req.body;

  if (!(password && confirmpassword)) {
    throw new customError("password and confirmPassword is required");
  }

  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: encryptedToken,
    forgotPasswordExpiry: {
      $gt: new Date(Date.now()),
    },
  }).select("+password");

  if (!user) {
    throw new customError("Link Expired or Invalid");
  }

  if (password !== confirmpassword) {
    throw new customError("password and confirmPassword does not match");
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  // send a json response
  cookieToken(user, res);
});

exports.dashboard = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  console.log(req.user._id, req.user.id);
  if (!user) {
    throw new customError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
  next();
});

exports.changepassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword && newPassword)) {
    throw new customError("All fields are required", 400);
  }

  const userId = req.user._id;
  const user = await User.findById(userId).select("+password");

  const isCorrectOldPassword = await user.isValidatedPassword(oldPassword);

  if (!isCorrectOldPassword) {
    throw new Error("Old Password does not match", 4000);
  }

  user.password = newPassword;

  await user.save();

  cookieToken(user, res);
});

exports.updateuserdetails = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (!(name && email)) {
    throw new customError("Enter All Details", 400);
  }
  let newData = {
    name,
    email,
  };

  if (req.files) {
    const user = await User.findById(req.user.id);
    const imeageId = user.photo.id;
    // delete photo from cloudinary
    const response = await cloudinary.uploader.destroy(imeageId);

    let userPhoto = req.files.photo;

    let result = await cloudinary.uploader.upload(userPhoto.tempFilePath, {
      folder: "probackend",
      width: 150,
      crop: "scale",
    });

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminAlluser = asyncHandler(async (req, res) => {
  const user = await User.find();

  res.status(200).json({
    suncess: true,
    user,
  });
});

exports.adminGetOneUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (!id) {
    throw new customError("User id not found", 400);
  }

  const user = await User.findById(id);

  if (!user) {
    throw new customError("User not found", 404);
  }

  res.status(200).json({
    suncess: true,
    user,
  });
});

exports.adminUpdateOneUserDetails = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  if (!(name && email)) {
    throw new customError("Enter All Details", 400);
  }
  let newData = {
    name,
    email,
    role,
  };

  // if photo available
  if (req.files) {
    const user = await User.findById(req.user.id);
    const imeageId = user.photo.id;
    // delete photo from cloudinary
    await cloudinary.uploader.destroy(imeageId);

    let userPhoto = req.files.photo;

    let result = await cloudinary.uploader.upload(userPhoto.tempFilePath, {
      folder: "probackend",
      width: 150,
      crop: "scale",
    });

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  await user.save();
  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminDeleteOneUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new customError("User not exists", 401);
  }

  const imeageId = user.photo.id;

  await cloudinary.uploader.destroy(imeageId);

  await user.remove();

  res.status(200).json({
    success: true,
    user,
  });
});

exports.managerAlluser = asyncHandler(async (req, res) => {
  const user = await User.find({ role: "user" });

  res.status(200).json({
    suncess: true,
    user,
  });
});
