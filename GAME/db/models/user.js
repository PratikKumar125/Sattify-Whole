const mongoose = require("mongoose");
const Bcrypt = require("bcrypt");
require("../connection.js");
const UserModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  profileSlug: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("USERS", UserModel);
module.exports = User;
