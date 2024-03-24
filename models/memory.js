import mongoose from "mongoose";

const memorySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memoryPath: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const memory = mongoose.model("memory", memorySchema);

export default memory;
