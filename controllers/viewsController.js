const Tours = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tours.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const tour = await Tours.findOne({ slug }).populate({
    path: 'reviews',
    field: 'review rating user',
  });
  // console.log(tour);

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: tour.name,
      tour,
    });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Login into your account',
  });
});
