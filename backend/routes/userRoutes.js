const express = require("express");
const { isLoggedIn, customRole } = require("../middleware/user.middleware");

const Router = express.Router();
const {
  signUp,
  login,
  logout,
  forgotPassword,
  passwordReset,
  dashboard,
  changepassword,
  updateuserdetails,
  adminAlluser,
  managerAlluser,
  adminGetOneUser,
  adminUpdateOneUserDetails,
  adminDeleteOneUser,
} = require("../controller/userController");

Router.post("/signup", signUp);
Router.post("/login", login);
Router.get("/logout", logout);
Router.post("/forgotpassword", forgotPassword);
Router.post("/password/reset/:token", passwordReset);
Router.get("/userdashboard", isLoggedIn, dashboard);
Router.post("/userdashboard/password/update", isLoggedIn, changepassword);
Router.post("/userdashboard/update", isLoggedIn, updateuserdetails);

Router.get("/admin/users", isLoggedIn, customRole("admin"), adminAlluser);
Router.get("/admin/user/:id", isLoggedIn, customRole("admin"), adminGetOneUser);
Router.put(
  "/admin/user/:id",
  isLoggedIn,
  customRole("admin"),
  adminUpdateOneUserDetails
);
Router.delete(
  "/admin/user/:id",
  isLoggedIn,
  customRole("admin"),
  adminDeleteOneUser
);

Router.get("/manager/users", isLoggedIn, customRole("manager"), managerAlluser);

module.exports = Router;
