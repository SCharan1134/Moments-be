import moment from "../models/moment.js";
import User from "../models/User.js";

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

/* READ */
export const getFeedMoments = async (req, res) => {
  try {
    const { userId } = req.params; // Assuming you have the current user object in req.user
    const currentUser = await User.findById(userId); // const friendsIds = currentUser.friends.map((friend) => friend._id);
    // Retrieve public moments and moments of friends
    const moments = await moment.find({
      $or: [
        { visibility: "public" }, // Public moments
        {
          visibility: "friends", // Friends' moments
          userId: { $in: currentUser.friends }, // Assuming currentUser.friends contains an array of user IDs who are friends
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
      $or: [
        // { visibility: "public" }, // Public moments
        {
          visibility: "friends", // Friends' moments
          userId: { $in: currentUser.friends }, // Assuming currentUser.friends contains an array of user IDs who are friends
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
      const moments = await moment.find({ userId });
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
