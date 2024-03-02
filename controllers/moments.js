import moment from "../models/moment.js";
import User from "../models/User.js";

/* CREATE */
export const createMoment = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newMoment = new moment({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await newMoment.save();

    const moment = await moment.find();
    res.status(201).json(moment);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedMoments = async (req, res) => {
  try {
    const moment = await moment.find();
    res.status(200).json(moment);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserMoments = async (req, res) => {
  try {
    const { userId } = req.params;
    const moment = await moment.find({ userId });
    res.status(200).json(moment);
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
