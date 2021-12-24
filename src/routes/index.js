const express = require("express");
const router = express.Router();
const employeeRoute = require("./employee.route");
const customerRoute = require("./customer.route");

router.use("/employee", employeeRoute);
router.use("/customer", customerRoute);

module.exports = router;
