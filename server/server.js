import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./models/message.js";
import Room from "./models/Room.js";
import logger from "./logger.js";



dotenv.config();

const app = express();
app.use(cors());
const server = http.createServer(app);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info("MongoDB connected"))
  .catch(err => logger.error(`MongoDB connection error: ${err}`));

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on("join_chat", async ({ username, room }) => {
    try {
      let roomDoc = await Room.findOne({ roomId: room });

      if (!roomDoc) {
        // Create room 
        roomDoc = await Room.create({ roomId: room, users: [username] });
      } else if (!roomDoc.users.includes(username)) {
        if (roomDoc.users.length >= 2) {
          socket.emit("join_error", "Room is full. Only 2 users allowed.");
          logger.error(`${username} tried to join full room ${room}`);
          return;
        }
        roomDoc.users.push(username);
        await roomDoc.save();
      }

      socket.join(room);
      logger.info(`${username} joined room ${room}`);

      socket.to(room).emit("receive_message", {
        author: "System",
        message: `${username} joined the chat`,
        time: new Date().getHours().toString().padStart(2,"0") + ":" +
              new Date().getMinutes().toString().padStart(2,"0")
      });

      // Load previous messages
      const previousMessages = await Message.find({ room }).sort({ createdAt: 1 });
      socket.emit("load_previous_messages", previousMessages);
      logger.info(`Loaded previous messages for room ${room}`);
    } catch (err) {
      logger.error(`Join chat error: ${err}`);
    }
  });

  socket.on("send_message", async ({ author, message, time, room }) => {
    try {
      if (room) {
        const newMessage = new Message({ author, message, time, room });
        await newMessage.save();
        io.to(room).emit("receive_message", { author, message, time });
        logger.info(`Message from ${author} in room ${room}: ${message}`);
      }
    } catch (err) {
      logger.error(`Send message error: ${err}`);
    }
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
