const catchAsync = require("../utils/catchAsync");
const { admin, db } = require("../services/firebase");
const { collection, query, where } = require("firebase/firestore");

const getAuthenticatedUser = catchAsync(async (req, res) => {
  try {
    const user_token = req.headers?.authorization?.split(" ")[1];
    const user_decoded = await admin.auth().verifyIdToken(user_token);
    const employee = collection(admin.firestore.Firestore, "employees");

    let q = query(employee, where("uid", "==", user_decoded?.uid));
    console.log(2, q);
    const querySnapshot = await getDocs(q);
    console.log(3, querySnapshot);
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
    console.log(error);
    res.status(400).send({ message: error });
  }
});

module.exports = {
  getAuthenticatedUser,
};
