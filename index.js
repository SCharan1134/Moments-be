import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import momentRoutes from "./routes/moments.js";
import friendRoutes from "./routes/friends.js";
import { register } from "./controllers/auth.js";
import { createMoment } from "./controllers/moments.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__filename, __dirname);
dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/avatar", express.static(path.join(__dirname, "public/avatar")));
app.use("/moments", express.static(path.join(__dirname, "public/moments")));

/* FILE STORAGE */

/* ROUTES WITH FILES */
// app.post("/auth/register", upload.single("picture"), register);
import { uploadAvatar } from "./middleware/multer-middle.js";
app.post("/upload", uploadAvatar.single("avatarPath"), async (req, res) => {
  try {
    // const { id } = req.params;
    // const user = await User.findById(id);
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", momentRoutes);
app.use("/friends", friendRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));
