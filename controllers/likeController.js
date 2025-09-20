const Like = require('../models/LikeModel');

exports.likeDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    const like = await Like.create({ dish: dishId, user: req.user._id });
    res.status(201).json({ status: 'success', data: { like } });
  } catch (e) {
    // Duplicate like
    if (e.code === 11000) {
      return res.status(200).json({ status: 'success', message: 'Already liked' });
    }
    res.status(400).json({ status: 'fail', message: e.message });
  }
};

exports.unlikeDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    await Like.findOneAndDelete({ dish: dishId, user: req.user._id });
    res.status(204).json({ status: 'success' });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};

exports.getDishLikes = async (req, res) => {
  try {
    const { dishId } = req.params;
    const likes = await Like.find({ dish: dishId }).populate('user', 'name email role');
    res.status(200).json({
      status: 'success',
      results: likes.length,
      data: { likes },
    });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};

exports.isLikedByMe = async (req, res) => {
  try {
    const { dishId } = req.params;
    const exists = await Like.exists({ dish: dishId, user: req.user._id });
    res.status(200).json({ status: 'success', data: { liked: !!exists } });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};