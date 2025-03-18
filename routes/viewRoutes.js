const express = require("express");
const { getOverview, login } = require("../controller/viewsController");
const { getTour } = require("../controller/viewsController");
const { isLoggedIn } = require("../controller/authController");

const router = express.Router();

router.use(isLoggedIn);

router.get("/", getOverview);
router.get("/tour/:slug", getTour);
router.get("/login", login);

module.exports = router;
