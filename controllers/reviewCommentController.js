const mongoose = require('mongoose');
const ReviewComment = require('../models/ReviewCommentModel');
const Review = require('../models/ReviewModel');

exports.createComment = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content, parentComment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid reviewId' });
    }
    if (parentComment && !mongoose.Types.ObjectId.isValid(parentComment)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid parentComment id' });
    }

    const exists = await Review.findById(reviewId);
    if (!exists) {
      return res.status(404).json({ status: 'fail', message: 'Review not found' });
    }

    if (parentComment) {
      const parent = await ReviewComment.findOne({ _id: parentComment, review: reviewId });
      if (!parent) {
        return res.status(400).json({ status: 'fail', message: 'Parent comment not in this review' });
      }
    }

    const comment = await ReviewComment.create({
      review: reviewId,
      parentComment: parentComment || null,
      user: req.user._id,
      content,
    });

    await comment.populate('user', 'name email role');

    res.status(201).json({ status: 'success', data: { comment } });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};

exports.getReviewThread = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid reviewId' });
    }

    const comments = await ReviewComment.find({ review: reviewId })
      .sort('createdAt')
      .populate('user', 'name email role')
      .lean();

    // Build tree (unbounded depth)
    const map = {};
    comments.forEach(c => {
      c.replies = [];
      map[c._id.toString()] = c;
    });

    const roots = [];
    comments.forEach(c => {
      if (c.parentComment) {
        const parent = map[c.parentComment.toString()];
        if (parent) parent.replies.push(c);
      } else {
        roots.push(c);
      }
    });

    res.status(200).json({
      status: 'success',
      results: roots.length,
      data: { comments: roots },
    });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ReviewComment.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
    if (!doc) {
      return res.status(404).json({ status: 'fail', message: 'Not found' });
    }
    res.status(204).json({ status: 'success' });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};