const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// Fetch All Messages for a Chat
const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email pic") // Populate sender with name, email, and pic
      .populate({
        path: "chat",
        populate: { path: "users", select: "name email" }, // Populate users within the chat
      });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// Send a New Message
const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res
      .sendStatus(400)
      .json({ message: "Content and ChatId are required" });
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    // Populate related fields
    message = await message.populate("sender", "name pic");
    message = await message.populate({
      path: "chat",
      populate: { path: "users", select: "name email" },
    });

    // Update the chat with the latest message
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = { allMessages, sendMessage };
