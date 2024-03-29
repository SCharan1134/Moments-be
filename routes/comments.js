import {
  createMomentComment,
  deleteComment,
  getAllCommentsForMoment,
  getAllRepliesForComment,
  getComment,
  getlikes,
  likeComment,
  replyComment,
} from "../controllers/comments.js";
import { verifyToken } from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router.post("/:momentId/create", verifyToken, createMomentComment);
router.post("/:commentId/reply", verifyToken, replyComment);
router.post("/:commentId/like", verifyToken, likeComment);
router.get("/:commentId/likes", verifyToken, getlikes);
router.get("/replies/:commentId", verifyToken, getAllRepliesForComment);
router.get("/:momentId", verifyToken, getAllCommentsForMoment);

router.get("/:id/cm", verifyToken, getComment);
router.delete("/:userId/:commentId", verifyToken, deleteComment);

export default router;
