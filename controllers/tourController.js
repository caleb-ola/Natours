const Tours = require('./../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');
exports.getTopCheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.field = 'name,duration,price,summary';
  next();
};

exports.getAllTours = factory.getAll(Tours);

// exports.addTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tours.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
//   // try {
//   //   const newTour = await Tours.create(req.body);
//   //   res.status(201).json({
//   //     status: 'success',
//   //     data: {
//   //       tour: newTour,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     staus: 'failed',
//   //     message: err,
//   //   });
//   // }
// });

// exports.updateTour = catchAsync(async (req, res) => {
//   const id = req.params.id;
//   const tour = await Tours.findByIdAndUpdate(id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('Cannot find a tour with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: tour,
//   });
//   // try {
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'failed',
//   //     message: err,
//   //   });
//   // }
// });
exports.getTour = factory.getOne(Tours, { path: 'reviews' });
exports.addTour = factory.createOne(Tours);
exports.updateTour = factory.updateOne(Tours);
exports.deleteTour = factory.deleteOne(Tours);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const id = req.params.id;
//   const tour = await Tours.findByIdAndDelete(id);
//   if (!tour) {
//     next(new AppError('Cannot find a tour with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: tour,
//   });
//   // try {
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'failed',
//   //   });
//   // }
// });

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tours.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  res.status(201).json({
    status: 'success',
    data: stats,
  });
  // try {

  // } catch (err) {
  //   res.status(400).json({
  //     status: 'failed',
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const stats = await Tours.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: 1 },
    },
  ]);
  res.status(201).json({
    status: 'success',
    data: stats,
  });
  // try {
  // } catch {
  //   res.status(400).json({
  //     status: 'failed',
  //   });
  // }
});
