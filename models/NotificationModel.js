import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["react", "comment", "friends"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    moment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "moment",
    },
    emoji: {
      type: String,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
