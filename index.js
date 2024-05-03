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
import memoryRoutes from "./routes/memory.js";
import commmentRoutes from "./routes/comments.js";
import messageRoutes from "./routes/message.js";
import NotificationRoutes from "./routes/notification.js";
import { app, server } from "./socket/socket.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__filename, __dirname);
dotenv.config();

// const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/avatar", express.static(path.join(__dirname, "public/avatar")));
app.use("/moments", express.static(path.join(__dirname, "public/moments")));
app.use("/memory", express.static(path.join(__dirname, "public/memory")));

/* FILE STORAGE */

/* ROUTES WITH FILES */
// app.post("/auth/register", upload.single("picture"), register);
app.get("/test", async (req, res) => {
  try {
    // const { id } = req.params;
    // const user = await User.findById(id);
    res.json("hello this is moments");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/moments", momentRoutes);
app.use("/friends", friendRoutes);
app.use("/memories", memoryRoutes);
app.use("/comments", commmentRoutes);
app.use("/messages", messageRoutes);
app.use("/notifications", NotificationRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));
