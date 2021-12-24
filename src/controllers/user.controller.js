const catchAsync = require("../utils/catchAsync");
const { admin, db } = require("../services/firebase");
const { collection, query, where } = require("firebase/firestore");

const getAuthenticatedUser = catchAsync(async (req, res) => {
  try {
    const user_token = req.headers?.authorization?.split(" ")[1];
    const user_decoded = await admin.auth().verifyIdToken(user_token);
    const employee = await admin
      .firestore()
      .collection("employees")
      .where("uid", "==", user_decoded?.uid)
      .get();

    console.log(employee);

    let result = employee.docs.forEach((doc) => {
      return { id: doc.id, ...doc.data() };
    });

    console.log(result);

    const user = {
      name: user_decoded?.name || "",
      email: user_decoded?.email || "",
      uid: user_decoded?.uid,
    };

    // send the employee to client
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error });
  }
});

module.exports = {
  getAuthenticatedUser,
};
