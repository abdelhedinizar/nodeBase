const express = require('express');
const { protect } = require('../controllers/AuthController');
const {
  createOrUpdateReview,
  getReviews,
  getReview,
  deleteReview,
  getMyReviewForDish,
} = require('../controllers/reviewController');

const router = express.Router();

router
  .route('/')
  .get(getReviews)
  .post(protect, createOrUpdateReview);

router
  .route('/:id')
  .get(getReview)
  .delete(protect, deleteReview);

router.get('/dish/:dishId/me', protect, getMyReviewForDish);

module.exports = router;