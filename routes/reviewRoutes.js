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

router.use(protectRoutes);
router
  .route("/")
  .get(getAllReviews)
  .post(restrictTo("user"), setTourUserIds, createReview);

router
  .route("/:id")
  .delete(restrictTo("user", "admin"), deleteReview)
  .patch(restrictTo("user", "admin"), updateReview)
  .get(getReview);

module.exports = router;
