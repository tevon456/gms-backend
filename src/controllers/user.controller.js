const catchAsync = require("../utils/catchAsync");
const { admin, db } = require("../services/firebase");
const { auth } = require("firebase-admin");
const yup = require("yup");
const { staffAccountCreatedEmail } = require("../services/email");

const getAuthenticatedUser = catchAsync(async (req, res) => {
  try {
    const user_token = req.headers?.authorization?.split(" ")[1];
    const user = await admin.auth().verifyIdToken(user_token);

    console.log(user);

    // // get employee from db and linked user
    // let employee = await db.collection("employees").doc(id).get();

    // let employee_uid = employee.data()?.uid;
    // let employee_user = await auth().getUser(employee_uid);

    // // send the employee to client
    // res.status(200).send({
    //   ...employee.data(),
    //   email: employee_user.email,
    //   displayName: employee_user.displayName,
    //   disabled: employee_user.disabled,
    // });
  } catch (error) {
    res.status(400).send({ message: "bad request" });
  }
});

module.exports = {
  getAuthenticatedUser,
};
