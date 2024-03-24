import moment from "../models/moment.js";
import User from "../models/User.js";
import fs from "fs";

/* CREATE */
export const createMoment = async (req, res) => {
  try {
    const { userId, description, momentPath, visibility } = req.body;
    const newMoment = new moment({
      userId,
      description,
      momentPath,
      visibility,
      likes: {},
      comments: {},
    });
    await newMoment.save();

    // const moments = await moment.find();
    res.status(201).json(newMoment);
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err.message });
  }
};

export const deleteMoment = async (req, res) => {
  try {
    const { momentId } = req.params;

    // Find the moment by ID
    const deletedMoment = await moment.findByIdAndDelete(momentId);

    if (!deletedMoment) {
      return res.status(404).json({ message: "Moment not found" });
    }

    // Remove the file associated with the moment from the multer storage
    fs.unlinkSync(`public/moments/${deletedMoment.momentPath}`);

    res.status(200).json({ message: "Moment deleted successfully" });
  } catch (error) {
    console.error("Error deleting moment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* READ */
export const getFeedMoments = async (req, res) => {
  try {
    const { userId } = req.params; // Assuming you have the current user object in req.user
    const currentUser = await User.findById(userId); // const friendsIds = currentUser.friends.map((friend) => friend._id);
    // Retrieve public moments and moments of friends
    const moments = await moment.find({
      $and: [
        { isArchive: false },
        {
          $or: [
            { visibility: "public" }, // Public moments
            {
              visibility: "friends", // Friends' moments
              userId: { $in: currentUser.friends }, // Assuming currentUser.friends contains an array of user IDs who are friends
            },
          ],
        },
      ],
    });

    res.status(200).json(moments);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getFriendsFeedMoments = async (req, res) => {
  try {
    const { userId } = req.params; // Assuming you have the current user object in req.user
    const currentUser = await User.findById(userId); // const friendsIds = currentUser.friends.map((friend) => friend._id);
    // Retrieve public moments and moments of friends
    const moments = await moment.find({
      $and: [
        { isArchive: false },
        {
          $or: [
            // { visibility: "public" }, // Public moments
            {
              visibility: "friends", // Friends' moments
              userId: { $in: currentUser.friends }, // Assuming currentUser.friends contains an array of user IDs who are friends
            },
          ],
        },
      ],
    });

    res.status(200).json(moments);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserMoments = async (req, res) => {
  try {
    // const currentUser = req.body; // Assuming you have the current user object in req.user
    const { userId, currentId } = req.params;

    // Check if the requested user is the current user
    if (userId === currentId) {
      // If the requested user is the current user, send all moments including private
      const moments = await moment.find({ userId, isArchive: false });
      res.status(200).json(moments);
    } else {
      // If the requested user is not the current user
      const currentUser = await User.findById(currentId);

      // Check if the requested user is a friend of the current user
      if (currentUser.friends.includes(userId)) {
        // If the requested user is a friend, send moments with public and friends visibility
        const moments = await moment.find({
          $and: [
            { userId },
            { isArchive: false },
            {
              $or: [
                { visibility: "public" },
                {
                  visibility: "friends",
                  userId: { $in: currentUser.friends },
                },
              ],
            },
          ],
        });
        res.status(200).json(moments);
      } else {
        // If the requested user is not a friend, send only public moments
        const moments = await moment.find({
          userId,
          visibility: "public",
        });
        res.status(200).json(moments);
      }
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const addArchive = async (req, res) => {
  try {
    const { userId, momentId } = req.body;

    // Update the moment document to set isArchive to true
    await moment.findByIdAndUpdate(momentId, { isArchive: true });

    // Update the user document to add the momentId to archiveMoments array
    await User.findByIdAndUpdate(userId, {
      $push: { archiveMoments: momentId },
    });

    res.status(200).json({ message: "Moment added to archive successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const removeArchive = async (req, res) => {
  try {
    const { userId, momentId } = req.body;

    // Update the moment document to set isArchive to false
    await moment.findByIdAndUpdate(momentId, { isArchive: false });

    // Update the user document to remove the momentId from archiveMoments array
    await User.findByIdAndUpdate(userId, {
      $pull: { archiveMoments: momentId },
    });

    res
      .status(200)
      .json({ message: "Moment removed from archive successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getArchiveMoments = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Retrieve the archive moments of the user
    const archiveMoments = await moment.find({
      _id: { $in: user.archiveMoments },
    });

    res.status(200).json(archiveMoments);
  } catch (error) {
    console.error("Error fetching archive moments:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/* UPDATE */
export const likeMoment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const Moment = await moment.findById(id);
    const isLiked = Moment.likes.get(userId);

    if (isLiked) {
      Moment.likes.delete(userId);
    } else {
      Moment.likes.set(userId, true);
    }

    const updatedmoment = await moment.findByIdAndUpdate(
      id,
      { likes: Moment.likes },
      { new: true }
    );

    res.status(200).json(updatedmoment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
