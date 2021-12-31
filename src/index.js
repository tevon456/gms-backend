require("dotenv").config({ debug: process.env.DEBUG });
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const router = require("./routes");
const { limiterMiddleware } = require("./middleware");
const app = express();
let port = process.env.PORT || 8000;

app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 5 * 1024 * 1024 * 1024, //5MB max file(s) size
    },
    abortOnLimit: true,
    responseOnLimit: "Maximum file size is 2mb",
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", limiterMiddleware, router);

app.use("/favicon.ico", (req, res, next) => {
  res.status(204).end();
});

app.use((req, res, next) => {
  res.status(400).send({ message: "not found" });
});

app.listen(port, () => {
  console.log(
    `${process.env.APP_NAME.toUpperCase()}-API listening at http://localhost:${port}`
  );
});

module.exports = app;
