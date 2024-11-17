const expressAsyncHandler = require("express-async-handler");
const Message = require("../modals/messageModel");
const Chat = require("../modals/chatModel");

// Send a new message
const SendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400).json({ message: "Content and ChatId are required" });
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name email");
    message = await message.populate({
      path: "Chat",
      select: "users lateMessages",
      populate: { path: "users", select: "name email" },
    });

    // update the chat with the latest message
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.status(201).json(message);
  } catch (error) {
    console.log("Error sending message", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = { SendMessage };
