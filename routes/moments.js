import express from "express";
import {
  createMoment,
  getUserMoments,
  getFeedMoments,
  likeMoment,
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
router.get("/feed", verifyToken, getFeedMoments);
router.get("/:userId/moments", verifyToken, getUserMoments);

/* UPDATE */
router.patch("/:id/like", verifyToken, likeMoment);

export default router;
