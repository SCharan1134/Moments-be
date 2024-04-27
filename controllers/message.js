import Conversation from "../models/ConversationModel.js";
import Message from "../models/MessageModel.js";
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message, senderId } = req.body;
    const { id: recipientId } = req.params;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);

    const receiverSocketId = getReceiverSocketId(recipientId);
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
    });

    if (!conversation)
      return res.status(404).json({ error: "Conversation not found" });

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages); // Status 200 for successful retrieval
  } catch (error) {
    console.error("Error in getMessages controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const conversations = await Conversation.find({
      participants: senderId,
    }).populate({
      path: "participants",
      select: "userName avatarPath",
    });

    // remove the current user from the participants array
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== senderId.toString()
      );
    });
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversations controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { senderId } = req.body;

    const conversation = await Conversation.findById(id).populate({
      path: "participants",
      select: "userName avatarPath",
    });

    conversation.participants = conversation.participants.filter(
      (participant) => participant._id.toString() !== senderId.toString()
    );
    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error in getConversation controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
