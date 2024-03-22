import mongoose from "mongoose";

const momentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: String,
    momentPath: String,
    avatarPath: String,
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
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

const moment = mongoose.model("moment", momentSchema);

export default moment;
