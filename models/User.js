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
      type: Array,
      default: [],
    },
    pendingFriends: {
      type: Array,
      default: [],
    },
    friendRequests: {
      type: Array,
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
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
