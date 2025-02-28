const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./factoryHandlers");

// middleware
const top5Tours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

// Tours Route Handlers
const getTours = getAll(Tour);
const getTour = getOne(Tour, "reviews");
const createTour = createOne(Tour);
const updateTour = updateOne(Tour);
const deleteTour = deleteOne(Tour);

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    message: "Tour successfully updated",
    data: { stats },
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
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
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { numTourStarts: -1 } },
  ]);

  res.status(200).json({
    status: "success",
    message: "Tour successfully updated",
    data: { plan },
  });
});

module.exports = {
  getTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  top5Tours,
  getTourStats,
  getMonthlyPlan,
};
