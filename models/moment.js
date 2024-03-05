import mongoose from "mongoose";

const momentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    location: String,
    description: String,
    momentPath: String,
    userPicturePath: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "friends"], // Possible values for visibility
      default: "public", // Default visibility is public
    },
    comments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const moment = mongoose.model("moment", momentSchema);

export default moment;
