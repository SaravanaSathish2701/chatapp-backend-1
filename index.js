const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");

const app = express();

dotenv.config();

app.use(express.json());

// CORS configuration to allow your frontend
app.use(cors({ origin: "https://chatapp-frontend27.netlify.app" }));

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Server is connected to Database");
  } catch (err) {
    console.error("Server is not connected to Database", err.message);
    process.exit(1);
  }
};

connectDb();

app.get("/", (req, res) => {
  res.send("API is Running.");
});

// Use routes
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is Running on port ${PORT}...`);
});

// Socket.io configuration
const io = require("socket.io")(server, {
  cors: {
    origin: "https://chatapp-frontend27.netlify.app",
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  socket.on("setup", (user) => {
    socket.join(user.data._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("new message", (newMessageStatus) => {
    const chat = newMessageStatus.chat;
    if (!chat.users) {
      return console.log("chat.users not defined");
    }
    chat.users.forEach((user) => {
      if (user._id === newMessageStatus.sender._id) return;

      socket.in(user._id).emit("message received", newMessageStatus);
    });
  });
});
