import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  checkMemory,
  createMemory,
  getAllMemories,
  getUserMemories,
} from "../controllers/memory.js";
import { uploadMemory } from "../middleware/multer-middle.js";

const router = express.Router();

router.post(
  "/creatememory",
  verifyToken,
  uploadMemory.single("memory"),
  createMemory
);
router.get("/check", verifyToken, checkMemory);
router.get("/all", verifyToken, getAllMemories);
router.get("/:userId", verifyToken, getUserMemories);

export default router;
