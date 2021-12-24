const { admin } = require("../services/firebase");

async function authAdminMiddleware(req, res, next) {
  try {
    const user_token = req.headers?.authorization?.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(user_token);
    console.log(decoded);
    admin.firestore().collection("employee").doc;
    next();
  } catch (e) {
    console.log("jwt failed");
    res.status(403).send({ message: "unauthorized" });
  }
}

module.exports = authAdminMiddleware;
