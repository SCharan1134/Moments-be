import express from "express";
import {
  addFriendRequest,
  acceptFriendRequest,
  removeFriend,
  removeFriendRequest,
} from "../controllers/friends.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.patch("/:id/:friendId", verifyToken, addFriendRequest);
router.patch("/request/:id/:friendId", verifyToken, acceptFriendRequest);

router.patch("/remove/:id/:friendId", verifyToken, removeFriend);
router.patch("/remove/request/:id/:friendId", verifyToken, removeFriendRequest);

export default router;
