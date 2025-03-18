const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const version = require("../constants");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  // remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exists
  if (!email || !password)
    return next(new AppError("Email or Password is missing!", 400));

  // check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password"); //explicitly select the password

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Incorrect email or password", 401));

  createSendToken(user, 200, res);
});

const protectRoutes = catchAsync(async (req, res, next) => {
  // Get and check if the token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError("You're not logged in. Kindly log in to gain access", 401)
    );
  // validate the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError("The user no longer exists!", 401));

  // check if user changed password after the jwt was issued
  if (currentUser.changePasswordAfter(decoded.iat))
    return next(
      new AppError("User recently changed password. Kindly log in again", 401)
    );

  // Grant access to the protected route
  req.user = currentUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You're not allowed to perform this action", 403)
      );
    }

    next();
  };
};

const isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // validate the token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // check if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next();

    // check if user changed password after the jwt was issued
    if (currentUser.changePasswordAfter(decoded.iat)) return next();

    // THERE IS A LOGGED IN USER
    res.locals.user = currentUser;
    return next();
  }

  next();
});

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email", 401));
  }

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to the user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/${version}/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't initiate this process, kindly ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token (valid for 10 minutes)",
      message,
    });

    res.status(200).json({ status: "success", message: "Token sent to mail" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(error);
    return next(
      new AppError("There was an error sending reset token to the user", 500)
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) update changedPasswordAt property for the user

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  console.log(req.user.id);
  // 1) Get the user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if the POSTed password is correct

  if (!(await user.correctPassword(currentPassword, user.password)))
    return next(new AppError("Your current password is wrong", 401));

  // 3) If so, update the password
  if (!newPassword) return next(new AppError("Enter a new password", 400));

  user.password = newPassword;
  user.confirmPassword = newPassword;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

module.exports = {
  signUp,
  login,
  protectRoutes,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
};
