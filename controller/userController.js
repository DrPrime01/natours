const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const { deleteOne, updateOne, getOne, getAll } = require("./factoryHandlers");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

// Users Route Handler

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(new AppError("This route is not for password updates.", 400));

  const filteredBody = filterObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: "success", data: null });
});

const getUsers = getAll(User);
const getUser = getOne(User);
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
const deleteUser = deleteOne(User);
const updateUser = updateOne(User);

module.exports = {
  getUsers,
  getUser,
  getMe,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
