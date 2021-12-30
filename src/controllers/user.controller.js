const catchAsync = require("../utils/catchAsync");
const { admin } = require("../services/firebase");

const getAuthenticatedUser = catchAsync(async (req, res) => {
  try {
    const user_token = req.headers?.authorization?.split(" ")[1];
    const user_decoded = await admin.auth().verifyIdToken(user_token);
    console.log("DECODED: ", user_decoded);
    const employee = await admin
      .firestore()
      .collection("employees")
      .where("uid", "==", user_decoded?.uid)
      .get();

    let [result] = employee.docs;

    console.log(result);

    const user = {
      name: user_decoded?.name || "",
      email: user_decoded?.email || "",
      uid: user_decoded?.uid,
      role: result.data()?.role,
    };

    res.status(200).send(user);
  } catch (error) {
    console.log("USER: ", error);
    res.status(400).send({ message: error });
  }
});

module.exports = {
  getAuthenticatedUser,
};
