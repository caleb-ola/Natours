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
  if (err?.isOperational === true) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
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
    sendErrorDev(err, res);
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
