import express from "express";
import {
  getConversation,
  getMessages,
  sendMessage,
} from "../controllers/message.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/:id", verifyToken, getMessages);
router.post("/:id/conversation", verifyToken, getConversation);
router.post("/send/:id", verifyToken, sendMessage);

export default router;
