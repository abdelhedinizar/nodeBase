const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    dish: {
      type: mongoose.Schema.ObjectId,
      ref: 'Dishs',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
  },
  {
    versionKey: false,
  }
);

// One review per user per dish
ReviewSchema.index({ dish: 1, user: 1 }, { unique: true });

ReviewSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

async function recalcRatings(dishId) {
  const Review = mongoose.model('Review');
  const Dish = mongoose.model('Dishs');
  const stats = await Review.aggregate([
    { $match: { dish: dishId } },
    {
      $group: {
        _id: '$dish',
        n: { $sum: 1 },
        avg: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Dish.findByIdAndUpdate(dishId, {
      ratingsQuantity: stats[0].n,
      ratingsAverage: stats[0].avg,
    });
  } else {
    await Dish.findByIdAndUpdate(dishId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
}

ReviewSchema.post('save', function () {
  recalcRatings(this.dish).catch(() => {});
});

ReviewSchema.post('findOneAndUpdate', function (doc) {
  if (doc) recalcRatings(doc.dish).catch(() => {});
});

ReviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) recalcRatings(doc.dish).catch(() => {});
});

module.exports = mongoose.model('Review', ReviewSchema);