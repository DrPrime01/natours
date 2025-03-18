const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tours data from collection
  const tours = await Tour.find();
  // 2) Build template

  // 3) Render that template using tour data from 1
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

const getProfile = catchAsync(async (req, res, next) => {
  res.status(200).render("account", {
    title: "My Profile",
  });
});

const getTour = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const slug = req.params.slug;
  if (!slug) return next(new AppError("The tour does not exist", 404));
  // 2) Build template

  // 3) Render that template using tour data from 1
  const tour = await Tour.findOne({ slug }).populate({
    path: "reviews",
    fields: "review rating user name",
  });

  if (!tour) {
    return new AppError("There is no tour with that name", 404);
  }

  const tourName = tour.name;
  res.status(200).render("tour", {
    title: tourName,
    tour,
  });
});

const login = (req, res) => {
  res.status(200).render("login", {
    title: "Login",
  });
};

const updateUserData = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name,
      email,
    },
    { new: true, runValidators: true }
  );

  res.status(200).render("account", {
    title: "Your account",
    user: updatedUser,
  });
});

module.exports = { getOverview, getTour, login, getProfile, updateUserData };
