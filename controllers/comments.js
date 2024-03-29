import mongoose from "mongoose";
import moment from "../models/moment.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

export const createMomentComment = async (req, res) => {
  try {
    const { momentId } = req.params;
    const { userId, description } = req.body;

    // Create a new comment
    const newComment = new Comment({
      userId: userId,
      description: description,
      likes: {},
      replies: [],
    });

    // Save the new comment to the database

    // Find the moment by ID
    const currentMoment = await moment.findById(momentId);
    const savedComment = await newComment.save();

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
    const { commentId } = req.params;
    const { userId, description } = req.body;

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
    const { commentId } = req.params;
    const { userId } = req.body;
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

export const getlikes = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (error) {
    console.error("Error getting likes of comment:", error);
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

export const getAllRepliesForComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Find the comment by ID
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Retrieve all replies for the comment, including nested replies
    const allReplies = await getAllNestedReplies(comment.replies);

    const commentsWithUserDetails = await Promise.all(
      allReplies.map(async (comment) => {
        const user = await User.findById(comment.userId);
        if (user) {
          const { userName, avatarPath } = user;
          return { ...comment.toObject(), userName, avatarPath }; // Merge user details with comment
        } else {
          return comment.toObject();
        }
      })
    );

    res.status(200).json(commentsWithUserDetails);
  } catch (error) {
    console.error("Error fetching all replies for comment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getAllNestedReplies = async (replyIds) => {
  const replies = await Comment.find({ _id: { $in: replyIds } });

  // for (const reply of replies) {
  //   if (reply.replies.length > 0) {
  //     reply.replies = await getAllNestedReplies(reply.replies);
  //   }
  // }

  return replies;
};

const getAllNestedComments = async (commentIds) => {
  const comments = await Comment.find({ _id: { $in: commentIds } });

  // for (const comment of comments) {
  //   if (comment.replies.length > 0) {
  //     comment.replies = await getAllNestedComments(comment.replies);
  //   }
  // }

  return comments;
};

export const getAllCommentsForMoment = async (req, res) => {
  try {
    const { momentId } = req.params;

    // Find the moment by ID
    const moments = await moment.findById(momentId);

    if (!moments) {
      return res.status(404).json({ message: "Moment not found." });
    }

    // Retrieve all comments for the moment, including nested comments
    const allComments = await getAllNestedComments(moments.comments);

    // Fetch user details for each comment and add username and avatarPath
    const commentsWithUserDetails = await Promise.all(
      allComments.map(async (comment) => {
        const user = await User.findById(comment.userId);
        if (user) {
          const { userName, avatarPath } = user;
          return { ...comment.toObject(), userName, avatarPath }; // Merge user details with comment
        } else {
          return comment.toObject();
        }
      })
    );

    res.status(200).json(commentsWithUserDetails);
  } catch (error) {
    console.error("Error fetching all comments for moment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
