const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const httpStatus = require("http-status");
const helmet = require("helmet");
const catchAsync = require("./utils/catchAsync");
const ApiError = require("./utils/ApiError");
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

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

//  apply to all requests
app.use(limiter);

app.get(
  "/",
  catchAsync(async (req, res) => {
    res.send({ message: "Hello World" });
  })
);

app.use("/favicon.ico", (req, res, next) => {
  res.status(204).end();
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:${3000}`);
});

module.exports = app;
