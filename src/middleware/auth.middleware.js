const { admin } = require("../services/firebase");

async function authMiddleware(req, res, next) {
  try {
    const user_token = req.headers?.authorization?.split(" ")[1];
    await admin.auth().verifyIdToken(user_token);
    next();
  } catch (e) {
    console.log("jwt failed");
    res.status(401).send({ message: "unauthorized" });
  }
}

module.exports = authMiddleware;
