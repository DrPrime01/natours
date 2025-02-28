const express = require("express");
const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require("../controller/reviewController");
const { protectRoutes, restrictTo } = require("../controller/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(protectRoutes, getAllReviews)
  .post(protectRoutes, restrictTo("user"), setTourUserIds, createReview);

router
  .route("/:id")
  .delete(protectRoutes, deleteReview)
  .patch(protectRoutes, updateReview)
  .get(protectRoutes, getReview);

module.exports = router;
