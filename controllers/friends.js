import User from "../models/User.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const addFriendRequest = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (
      !user.friends.includes(friendId) &&
      !user.friendRequests.includes(friendId) &&
      !user.pendingFriends.includes(friendId)
    ) {
      user.pendingFriends.push(friendId);
      friend.friendRequests.push(id);

      await user.save();
      await friend.save();

      const receiverSocketId = getReceiverSocketId(friendId);
      if (receiverSocketId) {
        // io.to(<socket_id>).emit() used to send events to specific client
        io.to(receiverSocketId).emit("newFriendRequest", id);
      }

      res.status(200).json(user);
    } else {
      res
        .status(400)
        .json({ message: "Friend request already sent or accepted" });
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    // Check if the friendId is in friendRequests
    if (user.friendRequests.includes(friendId)) {
      // Remove friendId from friendRequests and add to friends
      user.friendRequests = user.friendRequests.filter((id) => id !== friendId);
      user.friends.push(friendId);

      friend.pendingFriends = friend.pendingFriends.filter((id) => id !== id);
      friend.friends.push(id);

      await user.save();
      await friend.save();

      const receiverSocketId = getReceiverSocketId(friendId);
      if (receiverSocketId) {
        // io.to(<socket_id>).emit() used to send events to specific client
        io.to(receiverSocketId).emit("acceptFriendRequest", id);
      }

      res.status(200).json(user);
    } else {
      res
        .status(400)
        .json({ message: "No pending friend request from this user" });
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    // Check if the friendId is in friends
    if (user.friends.includes(friendId)) {
      // Remove friendId from friends for both users
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);

      await user.save();
      await friend.save();

      const receiverSocketId = getReceiverSocketId(friendId);
      if (receiverSocketId) {
        // io.to(<socket_id>).emit() used to send events to specific client
        io.to(receiverSocketId).emit("removeFriend", id);
      }

      res.status(200).json(user);
    } else {
      res.status(400).json({ message: "User is not in your friends list" });
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const removeFriendRequest = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    // Check if the friendId is in friendRequests
    if (user.pendingFriends.includes(friendId)) {
      // Remove friendId from friendRequests for both users
      user.pendingFriends = user.pendingFriends.filter((id) => id !== friendId);
      friend.friendRequests = friend.friendRequests.filter((id) => id !== id);
      console.log(user);
      await user.save();
      await friend.save();

      const receiverSocketId = getReceiverSocketId(friendId);
      if (receiverSocketId) {
        // io.to(<socket_id>).emit() used to send events to specific client
        io.to(receiverSocketId).emit("removeFriendRequest", id);
      }

      res.status(200).json(user);
    } else {
      res
        .status(400)
        .json({ message: "No pending friend request from this user" });
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    // Check if the friendId is in friendRequests
    if (user.friendRequests.includes(friendId)) {
      // Remove friendId from friendRequests for both users
      user.friendRequests = user.friendRequests.filter((id) => id !== friendId);
      friend.pendingFriends = friend.pendingFriends.filter((id) => id !== id);

      await user.save();
      await friend.save();

      const receiverSocketId = getReceiverSocketId(friendId);
      if (receiverSocketId) {
        // io.to(<socket_id>).emit() used to send events to specific client
        io.to(receiverSocketId).emit("declineFriendRequest", id);
      }

      res.status(200).json(user);
    } else {
      res
        .status(400)
        .json({ message: "No pending friend request from this user" });
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
