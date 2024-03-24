import express from "express";
import {
  createMoment,
  getUserMoments,
  getFeedMoments,
  likeMoment,
  getFriendsFeedMoments,
  deleteMoment,
  getArchiveMoments,
  removeArchive,
  addArchive,
} from "../controllers/moments.js";
import { verifyToken } from "../middleware/auth.js";
import { uploadMoment } from "../middleware/multer-middle.js";

const router = express.Router();

router.post(
  "/createmoment",
  verifyToken,
  uploadMoment.single("moment"),
  createMoment
);
/* READ */
router.get("/:userId/feed", verifyToken, getFeedMoments);
router.get("/:userId/feed/friend", verifyToken, getFriendsFeedMoments);
router.get("/:userId/:currentId/moments", verifyToken, getUserMoments);
router.delete("/:momentId", verifyToken, deleteMoment);

router.get("/:userId/archive", verifyToken, getArchiveMoments);
router.post("/archive/add", verifyToken, addArchive);
router.post("/archive/remove", verifyToken, removeArchive);

/* UPDATE */
router.patch("/:id/like", verifyToken, likeMoment);

export default router;
