const connectToMongo = require("./config/database");
connectToMongo();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const YAML = require("yamljs");
// const swaggerUi = require("swagger-ui-express");
const cloudinary = require("cloudinary");

// Routes
const RouterHome = require("./routes/home.routes.js");
const RouterUser = require("./routes/userRoutes");
const RouterProduct = require("./routes/product.route");
const RouterPayment = require("./routes/payment.route");
const RouterOrder = require("./routes/order.route");

const swaggerUi = require("swagger-ui-express");
// const swaggerDocument = require("./swagger.json");

const swaggerDocument = YAML.load("./swagger.yaml");
const config = require("./config/index");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);
cloudinary.config({
  cloud_name: config.CLOUD_NAME,
  api_key: config.API_KEY,
  api_secret: config.API_SECRET,
});

app.use(morgan("tiny")); // place it before router
app.use("/api/v1", RouterHome);
app.use("/api/v1", RouterUser);
app.use("/api/v1", RouterProduct);
app.use("/api/v1", RouterPayment);
app.use("/api/v1", RouterOrder);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header("Access-Control-Allow-Origin", req.headers.origin);
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
//   );
//   if ("OPTIONS" == req.method) {
//     res.send(200);
//   } else {
//     next();
//   }
// });

app.get("/", (_req, res) => {
  res.render("signupTest.ejs");
});

module.exports = app;
