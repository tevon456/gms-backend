require("dotenv").config({ debug: process.env.DEBUG });
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const httpStatus = require("http-status");
const helmet = require("helmet");
const { auth } = require("./services/firebase");
const {
  getAllEmployee,
  createEmployee,
  getSingleEmployee,
  updateEmployee,
  deleteEmployee,
} = require("./controllers/controllers");
const app = express();

const PORT = 8000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

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
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

/* ROUTES */
async function authMiddleware(req, res, next) {
  console.log(req.headers);
  // const decodedToken = await auth.verifyIdToken();
  next();
}

app.get("/", authMiddleware, function (req, res) {
  res.send({ message: `gms-api ${new Date().toLocaleDateString()}` });
});
app.get("/employee", getAllEmployee);
app.get("/employee/:id", getSingleEmployee);
app.post("/employee", createEmployee);
app.patch("/employee/:id", updateEmployee);
app.delete("/employee/:id", deleteEmployee);

/* FURTHER CONFIG */

app.use("/favicon.ico", (req, res, next) => {
  res.status(204).end();
});

app.use((req, res, next) => {
  next(res.status(httpStatus.NOT_FOUND).send({ message: "Not found" }));
});

app.listen(PORT, () => {
  console.log(`GMS-API listening at http://localhost:${PORT}`);
});

module.exports = app;
