const express = require("express");
const routes = require("../controller/userController");
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protectRoutes,
  restrictTo,
  logout,
} = require("../controller/authController");

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = routes;

const router = express.Router();

// Param middleware
// router.param("id", (req, res, next, val) => {
//   console.log(val);
//   next();
// });
router.post("/signup", signUp);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

// Authenticated routes
router.use(protectRoutes); // add a middleware to protect the routes below

router.get("/me", getMe, getUser);
router.patch("/update-password", updatePassword);
router.patch("/update-me", uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete("/delete-me", deleteMe);

router.use(restrictTo("admin")); // all routes below are protected and restricted to admin only
router.route(`/`).get(getUsers);
router.route(`/:id`).get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
