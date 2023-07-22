const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

exports.getAllReviews = factory.getAll(Review);

// exports.addReview = catchAsync(async (req, res) => {
//   //   const { review, rating } = req.body;
//   //   const bodyReview = {
//   //     review,
//   //     rating,
//   //     tour: req.params.tourID,
//   //     user: req.user.id,
//   //   };
//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourID;
  next();
};
exports.addReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
