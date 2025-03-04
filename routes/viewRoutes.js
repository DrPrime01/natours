const express = require("express");
const { getOverview } = require("../controller/viewsController");
const { getTour } = require("../controller/viewsController");

const router = express.Router();

router.get("/", getOverview);
router.get("/tour/:slug", getTour);

module.exports = router;
