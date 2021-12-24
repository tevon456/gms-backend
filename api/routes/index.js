const express = require("express");
const router = express.Router();
const employeeRoute = require("./employee.route");
const customerRoute = require("./customer.route");

router.use("/", function (req, res) {
  res.send({ message: `gms-api ${new Date().toLocaleDateString()}` }); // root api response
});
router.use("/favicon.ico", function (req, res) {
  res.status(204).end(); // return a 2XX response to browser default favicon request
});

router.use("/employee", employeeRoute);
router.use("/customer", customerRoute);

module.exports = router;
