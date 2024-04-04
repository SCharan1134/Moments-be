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
    emojis: {
      type: Map,
      of: String, // Store the emoji as a string
    },
    visibility: {
      type: String,
      enum: ["public", "private", "friends"], // Possible values for visibility
      default: "public", // Default visibility is public
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment", // Reference to the Comment model
      },
    ],
    isArchive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const moment = mongoose.model("moment", momentSchema);

export default moment;
