import Notification from "../models/NotificationModel.js";

export const getReadNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({
      to: userId,
      read: true,
    }).populate({
      path: "from moment",
      select: "_id userName avatarPath momentPath",
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.log("error at getReadNotifications", error);
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({
      to: userId,
      read: false,
    })
      .populate({
        path: "from moment",
        select: "_id userName avatarPath momentPath",
      })
      .sort({ createdAt: -1 });

    // await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.log("error at getNotifications", error);
  }
};
