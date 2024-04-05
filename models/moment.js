import mongoose from "mongoose";

const momentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: String,
    momentPath: {
      type: Array,
      of: String,
      validate: [
        arrayMaxLengthValidator,
        "Moment path array exceeds maximum length of 6",
      ],
    },
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

function arrayMaxLengthValidator(value) {
  return value.length <= 6;
}

const moment = mongoose.model("moment", momentSchema);

export default moment;
