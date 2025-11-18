const express = require('express');
const { protect } = require('../controllers/AuthController');
const {
  createOrUpdateReview,
  getReviews,
  getReview,
  deleteReview,
  getMyReviewForDish,
  getReviewsGrouped
} = require('../controllers/reviewController');

const router = express.Router();

// Grouped reviews (must be before /:id)
router.get('/grouped', getReviewsGrouped);

router
  .route('/')
  .get(getReviews)
  .post(protect, createOrUpdateReview);

router.get('/dish/:dishId/me', protect, getMyReviewForDish);

router
  .route('/:id')
  .get(getReview)
  .delete(protect, deleteReview);

router.get('/dish/:dishId/me', protect, getMyReviewForDish);

module.exports = router;