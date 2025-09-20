const Dish = require('./../models/dishModel');
const APIFeatures = require('./../utils/APIFeatures');
const path = require('path');
const fs = require('fs');
const Like = require('../models/LikeModel');

const getAllDishs = async (req, res) => {
  try {
    const features = new APIFeatures(Dish.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const dishs = await features.query;

    let likedSet = new Set();
    if (req.user && dishs.length) {
      const ids = dishs.map(d => d._id);
      const likes = await Like.find({ user: req.user._id, dish: { $in: ids } }).select('dish');
      likedSet = new Set(likes.map(l => l.dish.toString()));
    }

    const data = dishs.map(d => {
      const obj = d.toObject({ virtuals: true });
      obj.isLikedByMe = req.user ? likedSet.has(d._id.toString()) : false;
      return obj;
    });

    res.status(200).json({
      status: 'success',
      results: data.length,
      data: { dishs: data },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ status: 'fail', message: 'Dish not found' });
    }

    let isLikedByMe = false;
    if (req.user) {
      const like = await Like.findOne({ user: req.user._id, dish: dish._id }).select('_id');
      isLikedByMe = !!like;
    }

    const obj = dish.toObject({ virtuals: true });
    obj.isLikedByMe = isLikedByMe;

    res.status(200).json({
      status: 'success',
      data: { dish: obj },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const createDish = async (req, res) => {
  try {
    const newDish = await Dish.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { dish: newDish },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
const updateDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        dish,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

const deleteDish = async (req, res) => {
  try {
    await Dish.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

module.exports = {
  getAllDishs,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
};
