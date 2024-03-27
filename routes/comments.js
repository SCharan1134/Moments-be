import {
  createMomentComment,
  deleteComment,
  getComment,
  likeComment,
  replyComment,
} from "../controllers/comments.js";
import { verifyToken } from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router.post("/create", verifyToken, createMomentComment);
router.post("/reply", verifyToken, replyComment);
router.post("/like", verifyToken, likeComment);

router.get("/:id", verifyToken, getComment);
router.delete("/:userId/:commentId", verifyToken, deleteComment);

export default router;
