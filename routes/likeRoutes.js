const express = require('express');
const { protect } = require('../controllers/AuthController');
const {
  likeDish,
  unlikeDish,
  getDishLikes,
  isLikedByMe,
} = require('../controllers/likeController');

const router = express.Router();

// Summary of likes for all dishes of a restaurant
router.get('/:dishId', getDishLikes);
router.get('/:dishId/me', protect, isLikedByMe);
router.post('/:dishId', protect, likeDish);
router.delete('/:dishId', protect, unlikeDish);

module.exports = router;