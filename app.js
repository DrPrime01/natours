const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");

const v = require("./constants");
const tourRouter = require("./routes/tourRoutes");
const usersRouter = require("./routes/usersRoutes");
const reviewRouter = require("./routes/reviewRoutes");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");

const app = express();

// Global Middleware
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP. Please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitize against NoSQL query injection
app.use(mongoSanitize());

// Data sanitize against xss attacks
app.use(xssClean());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// to allow express serve static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// routes
app.use(`/api/${v}/tours`, tourRouter);
app.use(`/api/${v}/users`, usersRouter);
app.use(`/api/${v}/reviews`, reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); // whenever the middleware next method receives an argument, the error handling middleware is immediately invoked while other middlewares are automatically skipped.
});

// Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
