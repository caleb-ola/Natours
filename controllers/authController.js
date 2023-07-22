const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.password,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  //   const correct = await User.checkPassword(password, user.password);
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Email or Password incorrect', 400));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Read the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //  console.log(token);
  if (!token) {
    next(new AppError('You are not authorized, please login', 401));
  }
  // 2. Verification of token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //   console.log(decode);

  // 3. Check if user still exists
  const freshUser = await User.findById(decode.id);
  //   console.log(freshUser);
  if (!freshUser) {
    next(new AppError('User no longer exists, please login again.', 401));
  }

  // 4. Check if user changed password after the token was issued
  const passChanged = await freshUser.changePasswordAfter(decode.iat);
  if (passChanged) {
    // console.log(passChanged);
    next(new AppError('Password changed, please login again.', 401));
  }

  //   ALLOW ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to do this', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the email posted
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    next(new AppError('There is no user with the email provided', 404));
  }
  // 2.  Generate the random reset token
  const resetToken = await user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 3.   Send token to the user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? submit a 
  PATCH request with your new password and passwordConfirm to: 
  ${resetURL}. \n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: `Your password reset token (valid for 10 mins )`,
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If token is not expired and ther is user, set the new password
  if (!user) {
    next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. Update changedPasswordAt property for the user

  // 4. Log the user in, send JWT
  const token = generateToken(user._id);
  res.status(201).json({
    status: 'success',
    token,
  });
});

exports.currentUser = catchAsync(async (req, res, next) => {});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  // 1. Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if posted current password is correct
  if (!user || !(await user.checkPassword(currentPassword, user.password))) {
    return next(new AppError('Password is incorrect', 403));
  }

  // 3. If so, update password
  //   if (newPassword !== confirmNewPassword) {
  //     return next(new AppError('New passwords must be the same', 400));
  //   }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordChangedAt = Date.now();
  user.save();
  // 4. Log user in, send JWT
  createSendToken(user, 201, res);
});
