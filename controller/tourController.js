const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
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

const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours,
    },
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      distances,
    },
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
  getToursWithin,
  getDistances,
};
