const express = require("express");
const routes = require("../controller/userController");
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protectRoutes,
} = require("../controller/authController");

const { getUsers, getUser, updateUser, deleteUser, updateMe, deleteMe } =
  routes;

const router = express.Router();

// Param middleware
// router.param("id", (req, res, next, val) => {
//   console.log(val);
//   next();
// });

router.post("/signup", signUp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/update-password", protectRoutes, updatePassword);
router.patch("/update-me", protectRoutes, updateMe);
router.delete("/delete-me", protectRoutes, deleteMe);

router.route(`/`).get(getUsers);
router.route(`/:id`).get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
