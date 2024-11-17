const mongoose = require("mongoose");

const messageModel = new mongoose.SchemaType(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  },
  {
    timeStamp: true,
    StrictPopulate: false,
  }
);

const Message = mongoose.model("Message", messageModel);
module.exports = Message;
