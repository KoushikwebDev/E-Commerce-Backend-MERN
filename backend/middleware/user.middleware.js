const User = require("../model/user");
const asyncHandler = require("./bigPromise");
const customError = require("../utils/customError");
const JWT = require("jsonwebtoken");
const config = require("../config/index");

exports.isLoggedIn = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.cookies.token ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer"))
  ) {
    token = req.cookies.token || req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new customError(
      "Not authorized to access this route, try login",
      401
    );
  }
  //   console.log("token", token);

  try {
    const decodedJWT = JWT.verify(token, config.JWT_SECRET);
    // console.log(decodedJWT);
    req.user = await User.findById(decodedJWT.id);
    // console.log(req.user, "auth");
    next();
  } catch (error) {
    console.log(error.message);
    throw new customError("Not authorized to access this route", 401);
  }
});

exports.customRole = (role) => {
  return (req, res, next) => {
    //     if (!roles.includes(req.user.role)) {
    //       throw new customError("You are Not allowed", 400);
    //     }
    //     next();
    console.log(req.user.role);
    if (req.user.role !== role) {
      throw new customError("You are Not allowed", 400);
    }
    next();
  };
};
