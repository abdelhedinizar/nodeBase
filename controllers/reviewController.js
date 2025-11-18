const Review = require('../models/ReviewModel');
const Dish = require('../models/dishModel');

exports.createOrUpdateReview = async (req, res) => {
  try {
    const { rating, comment, dish, media } = req.body;
    if (!dish) {
      return res.status(400).json({ status: 'fail', message: 'dish is required' });
    }
    const review = await Review.create({
      dish,
      user: req.user._id,
      rating,
      comment,
      media
    });

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
      .populate('user', 'name email role photo')
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
    const review = await Review.findById(req.params.id).populate('user', 'name email role photo');
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
      .populate('user', 'name email role photo');
    res.status(200).json({ status: 'success', data: { review } });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};

// Get reviews grouped by category -> dishes -> reviews
exports.getReviewsGrouped = async (req, res) => {
  try {
    const { restaurant, minRating } = req.query;
    const matchDish = {};
    if (restaurant) matchDish.restaurant = restaurant;

    const ratingFilter = minRating ? { $gte: Number(minRating) } : undefined;

    const pipeline = [
      { $match: matchDish },
      {
        $lookup: {
          from: 'reviews',
          let: { dishId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$dish', '$$dishId'] } } },
            ...(ratingFilter ? [{ $match: { rating: ratingFilter } }] : []),
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
                pipeline: [{ $project: { _id: 1, name: 1, email: 1, role: 1, photo: 1} }],
              },
            },
            { $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
            { $project: { dish: 0 } },
          ],
          as: 'reviews',
        },
      },
      { $match: { 'reviews.0': { $exists: true } } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',      // dish.category holds the category name
          foreignField: 'name',        // adjust if your Category model uses another field
          as: 'categoryDoc',
          pipeline: [{ $project: { _id: 1, name: 1 } }],
        },
      },
      {
        $addFields: {
          categoryId: { $ifNull: [{ $arrayElemAt: ['$categoryDoc._id', 0] }, null] },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          categoryId: 1,
          reviews: 1
        }
      },
      {
        $group: {
          _id: { name: '$category', id: '$categoryId' },
          dishes: {
            $push: {
              id: '$_id',
              name: '$name',
              reviews: '$reviews'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id.name',
          categoryId: '$_id.id',
          dishes: 1
        }
      },
      { $sort: { name: 1 } },
    ];

    const categories = await Dish.aggregate(pipeline);

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories },
    });
  } catch (e) {
    res.status(400).json({ status: 'fail', message: e.message });
  }
};