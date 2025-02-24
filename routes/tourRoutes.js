const express = require("express");
const routes = require("../controller/tourController");
const { restrictTo, protectRoutes } = require("../controller/authController");

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

// Aliasing
router.route("/top-5-cheap").get(top5Tours, getTours);

//Aggregated routes
router.route("/stats").get(getTourStats);
router.route("/monthly-plan").get(getMonthlyPlan);

router.route(`/`).get(protectRoutes, getTours).post(protectRoutes, createTour);
router
  .route(`/:id`)
  .get(protectRoutes, getTour)
  .patch(protectRoutes, updateTour)
  .delete(protectRoutes, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
