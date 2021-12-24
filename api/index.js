require("dotenv").config({ debug: process.env.DEBUG });
const express = require("express");
const cors = require("cors");
const httpStatus = require("http-status");
const helmet = require("helmet");
const router = require("./routes");
const { limiterMiddleware, fileMiddleware } = require("./middleware");
const app = express();

app.use(fileMiddleware);
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiterMiddleware);
app.use(router);

app.use((req, res, next) => {
  next(res.status(httpStatus.NOT_FOUND).send({ message: "Not found" }));
});

app.listen(process.env.APP_PORT, () => {
  console.log(
    `${process.env.APP_NAME.toUpperCase()}-API listening at http://localhost:${
      process.env.APP_PORT
    }`
  );
});

module.exports = app;
