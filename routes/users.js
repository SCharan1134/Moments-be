import express from "express";
import {
  getNotification,
  getRandomUsers,
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
router.get("/:id/notification", verifyToken, getNotification);
router.get("/:id/friends", verifyToken, getUserFriends);
router.post("/send-verification-code", sendVerificationCode);
router.put("/reset-password/:id", verifyToken, resetPassword);
router.post(
  "/updateuser/:id",
  verifyToken,
  uploadAvatar.single("avatar"),
  updateUser
);
router.get("/random/:userId", getRandomUsers);

export default router;
