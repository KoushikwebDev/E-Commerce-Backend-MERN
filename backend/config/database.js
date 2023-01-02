const mongoose = require("mongoose");
const config = require("./index");

const connectToMongo = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((conn) => {
      console.log("Database Connection Success to " + conn.connection.host);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectToMongo;
