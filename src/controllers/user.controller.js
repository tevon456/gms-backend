const catchAsync = require("../utils/catchAsync");
const { admin, db } = require("../services/firebase");
const { query, where } = require("firebase/firestore");
const { auth } = require("firebase-admin");
const yup = require("yup");
const { staffAccountCreatedEmail } = require("../services/email");

const getAuthenticatedUser = catchAsync(async (req, res) => {
  try {
    const user_token = req.headers?.authorization?.split(" ")[1];
    const user_decoded = await admin.auth().verifyIdToken(user_token);

    let employee = db.collection("employees");
    const q = query(employee, where("uid", "==", user_decoded?.uid));
    const querySnapshot = await getDocs(q);
    let result = querySnapshot.forEach((doc) => {
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
    res.status(400).send({ message: "bad request" });
  }
});

module.exports = {
  getAuthenticatedUser,
};
