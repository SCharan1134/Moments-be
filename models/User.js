import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    avatarPath: {
      type: String,
      default: " ",
    },
    friends: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    pendingFriends: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    friendRequests: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationCode: {
      type: String,
    },
    isverified: {
      type: Boolean,
      default: false,
    },
    recievedverification: {
      type: String,
    },
    favoriteMoments: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    archiveMoments: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
