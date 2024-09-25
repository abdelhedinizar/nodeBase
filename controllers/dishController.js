const Dish = require('./../models/dishModel');
const APIFeatures = require('./../utils/APIFeatures');

const getAllDishs = async (req, res) => {
  try {
    const features = new APIFeatures(Dish.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const dishs = await features.query;
    res.status(200).json({
      status: 'success',
      length: dishs.length,
      data: { dishs },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e,
    });
  }
};

const getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      length: dish ? 1 : 0,
      data: { dish },
    });
  } catch (e) {
    res.status(400).json({
      status: 'error',
      message: e,
    });
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
