import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import argon2 from "argon2";

import { generateVerificationCode } from "../utils/helper/generatecode.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

const transporter = nodemailer.createTransport({
  // host: "smtp.gmail.com",
  service: "gmail",
  // port: 587,
  // secure: false,
  auth: {
    user: "themoments2024@gmail.com",
    pass: "xoen awrn wzuz eyzl",
  },
});

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      userName,
      email,
      password,
      profilePicture,
      friends,
      friendRequests,
    } = req.body;

    if (!firstName || !lastName || !userName || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const verificationCode = generateVerificationCode();

    // Send verification email
    const mailOptions = {
      from: "themoments2024@gmail.com",
      to: email,
      subject: "Email Verification",
      text: `Your verification code is: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);

    // const salt = await bcrypt.genSalt();
    const passwordHash = await argon2.hash(password);

    const newUser = new User({
      firstName,
      lastName,
      userName,
      email,
      password: passwordHash,

      profilePicture,
      friends,
      friendRequests,
      verificationCode,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    if (!user.isverified)
      return res.status(400).json({ msg: "please verify your email address" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    generateTokenAndSetCookie(user._id, res);
    delete user.password;
    const { password: _, ...userData } = user.toObject();
    res.status(200).json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifycode = async (req, res) => {
  try {
    const { id } = req.params;
    const { recievedverification } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.verificationCode == recievedverification) {
      user.isverified = true;
      await user.save();

      res.status(200).json({ isValid: true });
    } else {
      res.status(400).json({ isValid: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkUserName = async (req, res) => {
  try {
    const { username } = req.params;
    const existingUser = await User.findOne({ userName: username });
    res.json({ isTaken: !!existingUser });
  } catch (error) {
    console.error("Error checking username availability:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
