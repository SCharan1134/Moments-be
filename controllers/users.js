import User from "../models/User.js";

import nodemailer from "nodemailer";
import cloudinary from "../utils/cloudinary.js";

import { generateVerificationCode } from "../utils/helper/generatecode.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      "-password -createdAt -updatedAt -isverified -verificationCode -isActive "
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
export const getNotification = async (req, res) => {
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
    const formattedFriends = friends.map(({ _id, userName, avatarPath }) => {
      return { _id, userName, avatarPath };
    });
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getFriendsWithDetails = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return { error: "User not found" };
    }

    // Retrieve detailed information for the user's friends
    const friendsDetails = await Promise.all(
      user.friends.map(async (friendId) => {
        const friend = await User.findById(friendId);
        return {
          _id: friend._id,
          userName: friend.userName,
          avatarPath: friend.avatarPath,
        };
      })
    );

    return friendsDetails;
  } catch (err) {
    console.error(err);
    return { error: "Internal server error" };
  }
};

export const searchFriendsByUsername = async (req, res) => {
  try {
    const { id } = req.params;

    const { query } = req.body;

    const friends = await getFriendsWithDetails(id);

    if (friends.error) {
      return res.status(404).json({ message: friends.error });
    }

    // Filter the friends by username
    const filteredFriends = friends.filter((friend) =>
      friend.userName.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredFriends.length === 0) {
      return res.status(200).json({});
    }

    res.status(200).json(filteredFriends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchUsersByUsername = async (req, res) => {
  try {
    const { query } = req.body;

    // Find users whose usernames match the search query
    const users = await User.find({
      userName: { $regex: query, $options: "i" },
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No matching users found" });
    }

    const formattedUsers = users.map(({ _id, userName, avatarPath }) => {
      return { _id, userName, avatarPath };
    });

    res.status(200).json(formattedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
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
    const friendRequestIds = currentUser.friendRequests.map(
      (request) => request
    );
    const pendingFriendsIds = currentUser.pendingFriends.map(
      (request) => request
    );

    const randomUsers = await User.find(
      {
        $and: [
          {
            _id: {
              $nin: [
                ...friendIds,
                ...friendRequestIds,
                ...pendingFriendsIds,
                currentUser._id,
              ],
            },
          },
          {
            $nor: [
              { friends: currentUser._id },
              { friendRequests: currentUser._id },
              { pendingFriends: currentUser._id },
            ],
          },
        ],
      },
      { _id: 1, avatarPath: 1, userName: 1 }
    ).limit(5);

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
    console.log(avatarPath);
    let user = await User.findById(id).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userName && userName !== user.userName) {
      // Check if the provided username already exists
      const existingUser = await User.findOne({ userName });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      user.userName = userName;
    }

    user.avatarPath = avatarPath || user.avatarPath;
    user = await user.save();

    return res
      .status(200)
      .json({ message: "User details updated successfully", user });
  } catch (error) {
    console.log(error);
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

export const getUsersForSidebar = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const friendIds = user.friends;
    const friends = await User.find({ _id: { $in: friendIds } });

    res.status(200).json(friends);
  } catch (error) {
    console.error("Error in getUsersForSidebar controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
