import moment from "../models/moment.js";
import User from "../models/User.js";

/* CREATE */
export const createMoment = async (req, res) => {
  try {
    const { userId, description, momentPath, visibility } = req.body;
    const user = await User.findById(userId);
    const newMoment = new moment({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      momentPath,
      visibility,
      likes: {},
      comments: [],
    });
    await newMoment.save();

    // const moment = await moment.find();
    res.status(201).json(newMoment);
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedMoments = async (req, res) => {
  try {
    const currentUser = req.user; // Assuming you have the current user object in req.user

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

export const getUserMoments = async (req, res) => {
  try {
    const currentUser = req.user; // Assuming you have the current user object in req.user
    const { userId } = req.params;

    // Check if the requested user is the current user
    if (userId === currentUser.id) {
      // If the requested user is the current user, send all moments including private
      const moments = await moment.find({ userId });
      res.status(200).json(moments);
    } else {
      // If the requested user is not the current user, apply feed logic
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
    const moment = await moment.findById(id);
    const isLiked = moment.likes.get(userId);

    if (isLiked) {
      moment.likes.delete(userId);
    } else {
      moment.likes.set(userId, true);
    }

    const updatedmoment = await moment.findByIdAndUpdate(
      id,
      { likes: moment.likes },
      { new: true }
    );

    res.status(200).json(updatedmoment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
