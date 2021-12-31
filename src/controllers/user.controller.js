const catchAsync = require("../utils/catchAsync");
const { admin } = require("../services/firebase");
const yup = require("yup");

const getAuthenticatedUser = catchAsync(async (req, res) => {
  try {
    const user_token = req.headers?.authorization?.split(" ")[1];
    const user_decoded = await admin.auth().verifyIdToken(user_token);
    const employee = await admin
      .firestore()
      .collection("employees")
      .where("uid", "==", user_decoded?.uid)
      .get();

    let [result] = employee.docs;

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

const updateAuthenticatedUser = catchAsync(async (req, res) => {
  try {
    console.log(req.body);
    let schema = yup.object().shape({
      first_name: yup.string().required(),
      last_name: yup.string().required(),
      email: yup.string().email(),
    });

    const isValid = await schema.isValid(req.body);

    if (isValid) {
      const user_token = req.headers?.authorization?.split(" ")[1];
      const user_decoded = await admin.auth().verifyIdToken(user_token);
      const employee = await admin
        .firestore()
        .collection("employees")
        .where("uid", "==", user_decoded?.uid)
        .get();

      let [result] = employee.docs;
      let employee_update = db.collection("employees").doc(result.id);

      await employee_update.update({
        ...result.data,
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        updated_at: new Date().toUTCString(),
      });

      await admin.auth().updateUser(user_decoded.uid, {
        displayName: `${req.body.first_name} ${req.body.last_name}`,
        email: req.body.email,
      });

      const user = {
        name: `${req.body.first_name} ${req.body.last_name}`,
        email: req.body.email,
        uid: user_decoded?.uid,
        role: result.data()?.role,
      };

      res.status(200).send(user);
    } else {
      schema.validate(req.body).catch((e) => {
        res.status(400).send({ message: e.errors });
      });
    }
  } catch (error) {
    console.log("USER UPDATE: ", error);
    res.status(400).send({ message: error });
  }
});

module.exports = {
  getAuthenticatedUser,
  updateAuthenticatedUser,
};
