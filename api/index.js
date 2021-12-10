const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const httpStatus = require("http-status");
const helmet = require("helmet");
const app = express();
const catchAsync = require("./utils/catchAsync");
const ApiError = require("./utils/ApiError");

// default options
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 2 * 1024 * 1024 * 1024, //2MB max file(s) size
    },
    abortOnLimit: true,
    responseOnLimit: "Maximum file size is 2mb",
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(cors());

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.get(
  "/",
  catchAsync(async (req, res) => {
    res.status(httpStatus["200_MESSAGE"]).send({ message: "Hello World" });
  })
);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

module.exports = app;
