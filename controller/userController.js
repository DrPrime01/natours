const fs = require("fs");
const path = require("path");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

const usersPath = path.resolve(__dirname, "../dev-data/data/users.json");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

// JSON Data
const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

// Users Route Handler
const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users,
    },
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const id = String(req.params.id);
  const user = await User.findById(id);
  if (!user) return next(new AppError("Invalid ID", 400));

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// const createUser = (req, res) => {
//   const newId = users[users.length - 1].id + 1;
//   const newUser = Object.assign({ id: newId }, req.body);
//   users.push(newUser);
//   fs.writeFile(usersPath, JSON.stringify(users), (err) => {
//     if (err)
//       return res
//         .status(500)
//         .json({ status: "error", message: "Internal server error" });
//     res.status(201).json({
//       status: "success",
//       message: "User successfully added",
//       data: { user: newUser },
//     });
//   });
// };

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

const updateUser = (req, res) => {
  const id = String(req.params.id);
  const body = req.body;
  const user = users.find((user) => user.id === Number(id));
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid id",
      data: {},
    });
  }
  const updatedUser = { ...user, ...body };
  const updatedUsers = users.map((user) =>
    user.id === id ? updatedUser : user
  );
  fs.writeFile(usersPath, JSON.stringify(updatedUsers), (err) => {
    if (err)
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    res.status(200).json({
      status: "success",
      message: "User successfully added",
      data: { tour: updatedUser },
    });
  });
};

const deleteUser = (req, res) => {
  const id = String(req.params.id);
  const user = users.find((user) => user.id === Number(id));
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid id",
      data: {},
    });
  }
  const updatedUsers = users.filter((tour) => tour.id !== id);
  fs.writeFile(usersPath, JSON.stringify(updatedUsers), (err) => {
    if (err)
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    res.status(204).json({
      status: "success",
      message: "User successfully deleted",
      data: null,
    });
  });
};

module.exports = {
  getUsers,
  getUser,
  // createUser,
  updateUser,
  deleteUser,
  updateMe,
};
