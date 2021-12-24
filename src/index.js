require("dotenv").config({ debug: process.env.DEBUG });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const router = require("./routes");
const { limiterMiddleware, fileMiddleware } = require("./middleware");
const app = express();

// app.use(fileMiddleware);
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

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(
    `${process.env.APP_NAME.toUpperCase()}-API listening at http://localhost:${port}`
  );
});

module.exports = app;
