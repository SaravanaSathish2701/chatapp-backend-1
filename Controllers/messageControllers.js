const expressAsyncHandler = require("express-async-handler");
const Message = require("../modals/messageModel");
const Chat = require("../modals/chatModel");

// Send a New Message
const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.error("Invalid data passed into request");
    return res.status(400).json({ message: "Content and ChatId are required" });
  }

  const newMessage = {
    sender: req.user._id, // Ensure `req.user` is populated with the logged-in user
    content,
    chat: chatId,
  };

  try {
    // Create the new message
    let message = await Message.create(newMessage);

    // Populate related fields after creation
    message = await message.populate("sender", "name email");
    message = await message.populate({
      path: "chat",
      select: "users latestMessage",
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

module.exports = { sendMessage };
