const Review = require('../models/ReviewModel');

exports.createOrUpdateReview = async (req, res) => {
  try {
    const { rating, comment, dish } = req.body;
    if (!dish) {
      return res.status(400).json({ status: 'fail', message: 'dish is required' });
    }
    const review = await Review.findOneAndUpdate(
      { dish, user: req.user._id },
      { rating, comment },
      { upsert: true, new: true, runValidators: true }
    ).populate('user', 'name email role');
    res.status(200).json({ status: 'success', data: { review } });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.dish) filter.dish = req.query.dish;
    const reviews = await Review.find(filter)
      .populate('user', 'name email role')
      .sort('-createdAt');
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};

exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('user', 'name email role');
    if (!review) return res.status(404).json({ status: 'fail', message: 'Not found' });
    res.status(200).json({ status: 'success', data: { review } });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const doc = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
    res.status(204).json({ status: 'success' });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};

exports.getMyReviewForDish = async (req, res) => {
  try {
    const review = await Review.findOne({ dish: req.params.dishId, user: req.user._id })
      .populate('user', 'name email role');
    res.status(200).json({ status: 'success', data: { review } });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};