const express = require("express");
const { isLoggedIn, customRole } = require("../middleware/user.middleware");
const {
  addProduct,
  getAllProduct,
  getSingleProduct,
  addProductReview,
  deleteProductReview,
  getOnlyReviewsForOneProduct,
  adminGetAllProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
} = require("../controller/product.controller");

const Router = express.Router();

//User
Router.get("/products", getAllProduct);
Router.get("/product/:id", getSingleProduct);
Router.put("/product/add/review", isLoggedIn, addProductReview);
Router.delete("/product/delete/review", isLoggedIn, deleteProductReview);
Router.get("/product/review", getOnlyReviewsForOneProduct);

// admin
Router.post("/admin/product/add", isLoggedIn, customRole("admin"), addProduct);
Router.get(
  "/admin/products",
  isLoggedIn,
  customRole("admin"),
  adminGetAllProduct
);
Router.put(
  "/admin/product/update/:id",
  isLoggedIn,
  customRole("admin"),
  adminUpdateOneProduct
);
Router.delete(
  "/admin/product/delete/:id",
  isLoggedIn,
  customRole("admin"),
  adminDeleteOneProduct
);

module.exports = Router;
