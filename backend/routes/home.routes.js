const express = require("express");
const { home } = require("../controller/homeController");

const Router = express.Router();

Router.get("/", home);

module.exports = Router;
