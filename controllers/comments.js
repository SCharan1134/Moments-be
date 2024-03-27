import mongoose from "mongoose";
import moment from "../models/moment.js";
import Comment from "../models/Comment.js";

export const createMomentComment = async (req, res) => {
  try {
    const { userId, momentId, description } = req.body;

    // Create a new comment
    const newComment = new Comment({
      userId,
      description,
      likes: {},
      replies: [],
    });

    // Save the new comment to the database
    const savedComment = await newComment.save();

    // Find the moment by ID
    const currentMoment = await moment.findById(momentId);

    if (!currentMoment) {
      return res.status(404).json({ message: "Moment not found" });
    }

    // Add the comment ID to the comments array in the moment
    currentMoment.comments.push(savedComment._id);

    // Save the updated moment
    await currentMoment.save();

    res.status(201).json(savedComment);
  } catch (error) {
    console.error("Error creating moment comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const replyComment = async (req, res) => {
  try {
    const { userId, commentId, description } = req.body;

    // Create a new comment for the reply
    const newComment = new Comment({
      userId,
      description,
      likes: {},
      replies: [],
    });

    // Save the new comment to the database
    const savedComment = await newComment.save();

    // Find the parent comment by ID
    const parentComment = await Comment.findById(commentId);

    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    // Add the ID of the newly created comment to the replies array in the parent comment
    parentComment.replies.push(savedComment._id);

    // Save the updated parent comment
    await parentComment.save();

    res.status(201).json(savedComment);
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// patch like
export const likeComment = async (req, res) => {
  try {
    const { userId, commentId } = req.body;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isLiked = comment.likes.get(userId);

    if (isLiked) {
      comment.likes.delete(userId);
    } else {
      comment.likes.set(userId, true);
    }

    // Save the updated comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { likes: comment.likes },
      { new: true }
    );

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error liking/unliking comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get
export const getComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the comment by ID
    const comment = await Comment.findById(id);

    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Return the comment
    res.status(200).json(comment);
  } catch (error) {
    console.error("Error fetching comment by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId, userId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You cannot delete this comment" });
    }

    await Comment.deleteMany({ _id: { $in: comment.replies } });

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
