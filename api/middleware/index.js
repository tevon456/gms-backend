const authMiddleware = require("./auth.middleware");
const authAdminMiddleware = require("./authAdmin.middleware");

module.exports = {
  authMiddleware,
  authAdminMiddleware,
};
