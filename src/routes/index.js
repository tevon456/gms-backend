const express = require("express");
const router = express.Router();
const employeeRoute = require("./employee.route");
const customerRoute = require("./customer.route");

router.get("/", (req, res) => {
  res
    .status(200)
    .send({
      message: `${process.env.APP_NAME} ${new Date().toLocaleTimeString()}`,
    });
});
router.use("/employee", employeeRoute);
router.use("/customer", customerRoute);

module.exports = router;
