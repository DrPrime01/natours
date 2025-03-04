const Tour = require("../models/tourModel");
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
  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

module.exports = { getOverview, getTour };
