const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

dotenv.config();

app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use(cors({ origin: "http://localhost:5173" }));

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log("Server is connected to Database");
  } catch (err) {
    console.log("Server is not connected to Database", err.message);
  }
};

connectDb();

app.get("/", (req, res) => {
  res.send("API is Running123.");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log("Server is Running..."));

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  pingTimeOut: 60000,
});

io.on("connection", (socket) => {
  socket.on("setup", (user) => {
    socket.join(user.data._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("new messaage", (newMessageStatus) => {
    var chat = newMessageStatus.chat;
    if (!chat.users) {
      return console.log("chat.users not defined");
    }
    chat.users.forEach((user) => {
      if (user._id == newMessageStatus.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
});
