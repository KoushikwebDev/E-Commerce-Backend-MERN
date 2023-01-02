const swaggerAutogen = require("swagger-autogen")();
const config = require("./config/index");

const doc = {
  info: {
    title: "My E-Commerce Web API",
    description: "Largest e-commerce brand of INDIA",
  },
  host: `${config.HOST}`,
  schemes: ["http", "https"],
  versions: ["v1"],
};

const outputFile = "./swagger.json";
const endpointsFiles = [
  "./routes/home.routes.js",
  "./routes/userRoutes.js",
  "./routes/product.route.js",
  "./routes/order.route.js",
  "./routes/payment.route.js",
];

swaggerAutogen(outputFile, endpointsFiles, doc);
