const mongoose = require('mongoose');

const ReviewCommentSchema = new mongoose.Schema(
  {
    review: {
      type: mongoose.Schema.ObjectId,
      ref: 'Review',
      required: true,
      index: true,
    },
    parentComment: {
      type: mongoose.Schema.ObjectId,
      ref: 'ReviewComment',
      default: null,
      index: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // For fast threaded reconstruction (root → ... → this)
    path: {
      type: [mongoose.Schema.ObjectId],
      index: true,
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// Build path before save
ReviewCommentSchema.pre('save', async function (next) {
  if (this.parentComment) {
    const parent = await this.constructor.findById(this.parentComment).select('path');
    if (parent) this.path = [...parent.path, this.parentComment];
  }
  next();
});

// Increment/decrement commentsCount on the Review
async function recalcComments(reviewId) {
  const ReviewComment = mongoose.model('ReviewComment');
  const Review = mongoose.model('Review');
  const total = await ReviewComment.countDocuments({ review: reviewId });
  await Review.findByIdAndUpdate(reviewId, { commentsCount: total });
}

ReviewCommentSchema.post('save', function () {
  recalcComments(this.review).catch(() => {});
});

ReviewCommentSchema.post('findOneAndDelete', function (doc) {
  if (doc) recalcComments(doc.review).catch(() => {});
});

// Cascade delete children when a comment is deleted
ReviewCommentSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await this.model.deleteMany({ parentComment: doc._id });
  }
  next();
});

module.exports = mongoose.model('ReviewComment', ReviewCommentSchema);