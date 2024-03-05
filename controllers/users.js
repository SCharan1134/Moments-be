import User from "../models/User.js";

import nodemailer from "nodemailer";
import cloudinary from "../utils/cloudinary.js";

import { generateVerificationCode } from "../utils/helper/generatecode.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, picturePath }) => {
        return { _id, firstName, lastName, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getRandomUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }
    const friendIds = currentUser.friends.map((friend) => friend._id);

    // Get random 5 users who are not friends of the current user
    const randomUsers = await User.aggregate([
      { $match: { _id: { $nin: [...friendIds, currentUser._id] } } }, // Exclude current user and friends
      { $sample: { size: 5 } },
      { $project: { _id: 1, avatarPath: 1, userName: 1 } }, // Randomly select 5 users
    ]);

    res.status(200).json(randomUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, avatarPath } = req.body;
    console.log(req.body);
    let user = await User.findById(id).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.userName = userName || user.userName;
    user.avatarPath = avatarPath || user.avatarPath;

    user = await user.save();

    return res
      .status(200)
      .json({ message: "User details updated successfully", user });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const transporter = nodemailer.createTransport({
  // host: "smtp.gmail.com",
  service: "gmail",
  // port: 587,
  // secure: false,
  auth: {
    user: "sricharanrayala24@gmail.com",
    pass: "nzibubwilncbgcka",
  },
});

export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate a random verification code
    const verificationCode = generateVerificationCode();

    // Associate the verification code with the user's email
    const user = await User.findOneAndUpdate(
      { email },
      { verificationCode },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send an email containing the verification code
    await transporter.sendMail({
      from: "sricharanrayala24@gmail.com",
      to: email,
      subject: "Password Reset Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    });
    user.isverified = false;
    await user.save();
    setTimeout(async () => {
      await expireVerificationCode(email);
    }, 2 * 60 * 1000);
    return res
      .status(200)
      .json({ message: "Verification code sent successfully" });
  } catch (err) {
    console.error("Error sending verification code:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
async function expireVerificationCode(email) {
  // Expire the verification code by removing it from the user document
  await User.findOneAndUpdate({ email }, { verificationCode: null });
}

// Route to verify verification code and change password
export const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    // Find the user by email and verification code
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "no user found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt();
    if (!user.isverified)
      return req.status(400).json({ message: "not verified" });
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
