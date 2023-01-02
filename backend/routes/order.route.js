const express = require("express");
const { isLoggedIn, customRole } = require("../middleware/user.middleware");

const Router = express.Router();

const {
  createOrder,
  findOneOrder,
  getLoggedInOrders,
  adminGetAllOrders,
  adminUpdateOrder,
  adminDeleteOrder,
} = require("../controller/order.controller");

Router.post("/order/create", isLoggedIn, createOrder);
Router.get("/order/find/:id", isLoggedIn, findOneOrder);
Router.get("/order/get/orders", isLoggedIn, getLoggedInOrders);

Router.get("/admin/orders", isLoggedIn, customRole("admin"), adminGetAllOrders);
Router.put(
  "/admin/update/order/:id",
  isLoggedIn,
  customRole("admin"),
  adminUpdateOrder
);
Router.delete(
  "/admin/order/delete/:id",
  isLoggedIn,
  customRole("admin"),
  adminDeleteOrder
);

module.exports = Router;
