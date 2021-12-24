require("dotenv").config({ debug: process.env.DEBUG });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const router = require("./routes");
const { limiterMiddleware, fileMiddleware } = require("./middleware");
const app = express();
let server;
let port = process.env.PORT || 8000;

app.use(fileMiddleware);
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", limiterMiddleware, router);

app.use("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.use((req, res) => {
  res.status(400).send({ message: "not found" });
});

server = app.listen(port, () => {
  console.log(
    `${process.env.APP_NAME.toUpperCase()}-API listening at http://localhost:${port}`
  );
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  console.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  console.info("SIGTERM received");
  if (server) {
    server.close();
  }
});

module.exports = app;
