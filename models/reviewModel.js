const mongoose = require('mongoose');
const Tours = require('./../models/tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      maxLength: [200, 'Review cannot be more than 200 words'],
      required: [true, 'A review is required'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating cannot be less than 1.0'],
      max: [5, 'Rating cannot be less than 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tours',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// QUERY MIDDLEWARE TO POPULATE TOURS AND USERS
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo ',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  await Tours.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].averageRating,
  });
};

reviewSchema.pre('save', async function (next) {
  //  this points to current review
  await this.constructor.calcAverageRatings(this.tour);
  next();
});

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   console.log(this.r);
// });
// reviewSchema.post(/^findOneAnd/, async function (next) {
//   await this.r.constructor.calAverageRatings(this.r.tour);
//   console.log(this.r);
// });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
