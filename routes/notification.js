import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getNotifications,
  getReadNotifications,
} from "../controllers/notification.js";

const router = express.Router();

router.get("/:userId", verifyToken, getNotifications);
router.get("/read/:userId", verifyToken, getReadNotifications);

export default router;
