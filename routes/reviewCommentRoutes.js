const express = require('express');
const { protect, optionalAuth } = require('../controllers/AuthController');
const {
  createComment,
  getReviewThread,
  deleteComment,
} = require('../controllers/reviewCommentController');

const router = express.Router({ mergeParams: true });

// Get full thread
router.get('/:reviewId', optionalAuth, getReviewThread);

// Create root or reply
router.post('/:reviewId', protect, createComment);

// Delete own comment
router.delete('/comment/:id', protect, deleteComment);

module.exports = router;