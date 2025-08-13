const Restaurant = require('../models/RestaurantModel');
const APIFeatures = require('../utils/APIFeatures');

const getAllRestaurants = async (req, res) => {
    try {
        const features = new APIFeatures(Restaurant.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const restaurants = await features.query.populate({
            path: 'owner',
            select: 'name email role',
        });
        res.status(200).json({
            status: 'success',
            length: restaurants.length,
            data: { restaurants },
        });
    } catch (e) {
        res.status(400).json({
            status: 'fail',
            message: e,
        });
    }
};

const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).populate({
            path: 'owner',
            select: 'name email role',
        });
        res.status(200).json({
            status: 'success',
            length: restaurant ? 1 : 0,
            data: { restaurant },
        });
    } catch (e) {
        res.status(400).json({
            status: 'error',
            message: e,
        });
    }
};

const createRestaurant = async (req, res) => {
    try {
        const newRestaurant = await Restaurant.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { restaurant: newRestaurant },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: 'success',
            data: { restaurant },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        await Restaurant.findByIdAndDelete(req.params.id);
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
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
};
