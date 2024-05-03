import { Server } from "socket.io";
import http from "http";
import express from "express";
import Conversation from "../models/ConversationModel.js";
import Message from "../models/MessageModel.js";
import Notification from "../models/NotificationModel.js";
import { read } from "fs";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: ["http://moments-s3.s3-website.ca-central-1.amazonaws.com"],
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});
// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173"],
//     methods: ["GET", "POST"],
//   },
// });

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId: conversationId, sender: userId, seen: false },
        { $set: { seen: true } }
      );
      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { "lastMessage.seen": true } }
      );
      io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("markNotificationsAsSeen", async ({ userId }) => {
    try {
      await Notification.updateMany({ to: userId }, { read: true });
      // io.to(userSocketMap[userId]).emit("notificationSeen", { conversationId });
    } catch (error) {
      console.log(error);
    }
  });

  // socket.on() is used to listen to the events. can be used both on client and server side
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
