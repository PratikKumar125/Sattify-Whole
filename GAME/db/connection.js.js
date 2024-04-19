const mongoose = require("mongoose");
const seedUsers = require("../seeders/users");
const dbUrl = "mongodb://localhost:27017/rbac";
const conncetionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose
  .connect(dbUrl, conncetionParams)
  .then(() => {
    console.log("connected to database");
    // seedUsers();
  })
  .catch((e) => {
    console.log(e);
  });
