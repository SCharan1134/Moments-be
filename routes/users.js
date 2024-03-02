import express from "express";
import {
  getUser,
  getUserFriends,
  resetPassword,
  sendVerificationCode,
  updateUser,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";
import { uploadAvatar } from "../middleware/multer-middle.js";

const router = express.Router();

/* READ */
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);
router.post("/send-verification-code", sendVerificationCode);
router.put("/reset-password/:id", resetPassword);
router.post(
  "/updateuser/:id",
  verifyToken,
  uploadAvatar.single("avatar"),
  updateUser
);

export default router;
