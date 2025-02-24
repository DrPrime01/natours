const express = require("express");
const morgan = require("morgan");
const v = require("./constants");
const tourRouter = require("./routes/tourRoutes");
const usersRouter = require("./routes/usersRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(`${__dirname}/public`)); // to allow express serve static files
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// routes
app.use(`/api/${v}/tours`, tourRouter);
app.use(`/api/${v}/users`, usersRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); // whenever the middleware next method receives an argument, the error handling middleware is immediately invoked while other middlewares are automatically skipped.
});

// Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
