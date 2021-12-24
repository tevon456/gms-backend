const authMiddleware = require("./auth.middleware");
const authAdminMiddleware = require("./authAdmin.middleware");
const fileMiddleware = require("./file.middleware");
const limiterMiddleware = require("./limiter.middleware");

module.exports = {
  limiterMiddleware,
  fileMiddleware,
  authMiddleware,
  authAdminMiddleware,
};
