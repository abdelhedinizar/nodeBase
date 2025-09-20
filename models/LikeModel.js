const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema(
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// Prevent duplicate likes
LikeSchema.index({ dish: 1, user: 1 }, { unique: true });

// After like added or removed, update Dish.likesCount
async function recalcLikesCount(dishId) {
  const Like = mongoose.model('Like');
  const Dish = mongoose.model('Dishs');
  const total = await Like.countDocuments({ dish: dishId });
  await Dish.findByIdAndUpdate(dishId, { likesCount: total });
}

LikeSchema.post('save', function () {
  recalcLikesCount(this.dish).catch(() => {});
});

LikeSchema.post('findOneAndDelete', function (doc) {
  if (doc) recalcLikesCount(doc.dish).catch(() => {});
});

module.exports = mongoose.model('Like', LikeSchema);