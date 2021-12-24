const { admin } = require("../services/firebase");

async function authMiddleware(req, res, next) {
  try {
    const user_token = req.headers?.authorization?.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(user_token);
    console.log(decoded);
    next();
  } catch (e) {
    console.log("jwt failed");
    res.status(401).send({ message: "unauthorized" });
  }
}

module.exports = authMiddleware;
