const mongoose = require("mongoose");
require("../connection.js");
const ChatModel = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: String,
    required: true,
    trim: true,
  },
  when: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

const Chat = mongoose.model("CHATS", ChatModel);
module.exports = Chat;
