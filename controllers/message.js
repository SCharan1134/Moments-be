import Conversation from "../models/ConversationModel.js";
import Message from "../models/MessageModel.js";
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message, senderId } = req.body;
    const { id: recieverId } = req.params;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recieverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recieverId],
      });
      await conversation.save();
    }

    const newMessage = new Message({
      senderId,
      recieverId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
          seen: false,
        },
      }),
      newMessage.save(),
    ]);

    const receiverSocketId = getReceiverSocketId(recieverId);
    if (receiverSocketId) {
      // io.to(<socket_id>).emit() used to send events to specific client
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in send message controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // Assuming id is the parameter for userToChatId
    const { senderId } = req.body; // Assuming senderId is provided in the request body

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    const messages = conversation.messages;

    res.status(200).json(messages); // Status 200 for successful retrieval
  } catch (error) {
    console.error("Error in getMessages controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // Assuming id is the parameter for userToChatId
    const { senderId } = req.body; // Assuming senderId is provided in the request body

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, userToChatId],
      });

      await conversation.save();
    }

    const messages = conversation.messages;

    res.status(200).json(conversation); // Status 200 for successful retrieval
  } catch (error) {
    console.error("Error in getConversation controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
