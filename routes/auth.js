import express from "express";
import {
  register,
  checkUserName,
  login,
  verifycode,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify/:id", verifycode);
router.post("/checkusername/:username", checkUserName);

export default router;
