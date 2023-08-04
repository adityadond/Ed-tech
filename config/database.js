const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connection to database successful");
    })
    .catch((err) => {
      console.error("Error connecting to database");
      console.log(err);
      process.exit(1);
    });
};
