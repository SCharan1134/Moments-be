import express from "express";
import {
  createMoment,
  getUserMoments,
  getFeedMoments,
  // likeMoment,
  getFriendsFeedMoments,
  deleteMoment,
  getArchiveMoments,
  removeArchive,
  addArchive,
  getMoment,
  getFavoriteMoments,
  addFavorite,
  removeFavorite,
  addEmojiToMoment,
  getUsersReactedToMoment,
} from "../controllers/moments.js";
import { verifyToken } from "../middleware/auth.js";
import { uploadMoment } from "../middleware/multer-middle.js";

const router = express.Router();

router.post(
  "/createmoment",
  verifyToken,
  uploadMoment.array("moment", 6),
  createMoment
);
/* READ */
router.get("/:momentId", verifyToken, getMoment);
router.get("/:userId/feed", verifyToken, getFeedMoments);
router.get("/:userId/feed/friend", verifyToken, getFriendsFeedMoments);
router.get("/:userId/:currentId/moments", verifyToken, getUserMoments);
router.delete("/:momentId", verifyToken, deleteMoment);

router.get("/:userId/archive", verifyToken, getArchiveMoments);
router.post("/archive/add", verifyToken, addArchive);
router.post("/archive/remove", verifyToken, removeArchive);

router.get("/:userId/favorite", verifyToken, getFavoriteMoments);
router.post("/favorite/add", verifyToken, addFavorite);
router.post("/favorite/remove", verifyToken, removeFavorite);

/* UPDATE */
// router.patch("/:id/like", verifyToken, likeMoment);
router.patch("/:id/emoji", verifyToken, addEmojiToMoment);
router.get("/:id/emojis", verifyToken, getUsersReactedToMoment);

export default router;
