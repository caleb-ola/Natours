const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateValue = () => {
  const message = 'Duplicate value';
  return new AppError(message, 400);
};
const handleValidationErrors = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('Invalid token, please log in again.', 401);

const handleTokenExpError = () =>
  new AppError('Expired token, please log in again.', 401);
const sendErrorProd = (err, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err?.isOperational === true) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.log('Error: ' + err);
      return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
  // RENDERED WEBSITE
  else {
    if (err?.isOperational === true) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
      });
    } else {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later',
      });
    }
  }
};
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // RENDERED WEBSITE FOR ERROR MESSAGE IN DEVELOPMENT ENVIRONMENT
    console.log('Error: ' + err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error;
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateValue(err);
    if (err.name === 'ValidationError') error = handleValidationErrors(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(err);
    if (err.name === 'TokenExpiredError') error = handleTokenExpError();
    sendErrorProd(error, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
    let error;
    // if (err.name === 'CastError') error = handleCastErrorDB(err);
    // if (err.code === 11000) error = handleDuplicateValue(err);
    // if (err.name === 'ValidationError') error = handleValidationErrors(err);
    // if (err.name === 'JsonWebTokenError') error = handleJWTError();
    // if (err.name === 'TokenExpiredError') error = handleTokenExpError();
    // sendErrorProd(error, res);
  }
  next();
};
