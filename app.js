const path = require("path");

const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const v = require("./constants");
const tourRouter = require("./routes/tourRoutes");
const usersRouter = require("./routes/usersRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");

const app = express();

app.enable("trust proxy");

// Set the template engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// to allow express serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Global Middleware

// Set security HTTP headers
app.use(helmet());

// Implement CORS
app.use(cors()); // allows only get and post, simple requests

app.options("*", cors()); // for all routes
// app.options("/api/v1/tours/:id", cors()) allows non-simple requests like patch, put, delete on that route

// app.use(cors({origin: "https://natours.vercel.app"})) It will allow http requests from only this origin on the web

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
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

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

// Set CSP header
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval'");
  next();
});

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log("cookies: ", req.cookies);
  next();
});

// routes
app.use("/", viewRouter);
app.use(`/api/${v}/tours`, tourRouter);
app.use(`/api/${v}/users`, usersRouter);
app.use(`/api/${v}/reviews`, reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); // whenever the middleware next method receives an argument, the error handling middleware is immediately invoked while other middlewares are automatically skipped.
});

// Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
