const express = require("express");
const {
  getOverview,
  login,
  getProfile,
  updateUserData,
} = require("../controller/viewsController");
const { getTour } = require("../controller/viewsController");
const { isLoggedIn, protectRoutes } = require("../controller/authController");

const router = express.Router();

router.get("/", isLoggedIn, getOverview);
router.get("/tour/:slug", isLoggedIn, getTour);
router.get("/login", isLoggedIn, login);
router.get("/me", protectRoutes, getProfile);
router.post("/submit-user-data", protectRoutes, updateUserData);

module.exports = router;
