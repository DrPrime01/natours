const express = require("express");
const routes = require("../controller/tourController");
const { restrictTo, protectRoutes } = require("../controller/authController");
const reviewRouter = require("./reviewRoutes");

const {
  getTours,
  createTour,
  updateTour,
  deleteTour,
  getTour,
  top5Tours,
  getTourStats,
  getMonthlyPlan,
} = routes;

const router = express.Router();

// Param middleware
// router.param("id", checkTourId);

// router
//   .route("/:tourId/reviews")
//   .post(protectRoutes, restrictTo("user"), createReview);
router.use("/:tourId/reviews", reviewRouter);

// Aliasing
router.route("/top-5-cheap").get(top5Tours, getTours);

//Aggregated routes
router.route("/stats").get(getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    protectRoutes,
    restrictTo("admin", "lead-guide", "guide"),
    getMonthlyPlan
  );

router
  .route(`/`)
  .get(getTours)
  .post(protectRoutes, restrictTo("admin", "lead-guide"), createTour);
router
  .route(`/:id`)
  .get(protectRoutes, getTour)
  .patch(protectRoutes, restrictTo("admin", "lead-guide"), updateTour)
  .delete(protectRoutes, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
