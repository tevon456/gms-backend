const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { admin, db } = require("../services/firebase");
const { auth } = require("firebase-admin");
const randomstring = require("randomstring");
const yup = require("yup");

const createEmployee = catchAsync(async (req, res) => {
  try {
    let schema = yup.object().shape({
      first_name: yup.string().required(),
      last_name: yup.string().required(),
      trn: yup.string().required(),
      gender: yup.string().required(),
      role: yup.mixed().oneOf(["admin", "sales_representative"]),
      email: yup.string().email(),
      disabled: yup.bool().required(),
      phone_number: yup.string().required(),
    });
    const isValid = await schema.isValid(req.body);

    if (isValid) {
      const newPassword = randomstring.generate({
        length: 9,
        charset: "alphanumeric",
      });

      const user = await auth().createUser({
        displayName: `${req.body.first_name} ${req.body.last_name}`,
        password: newPassword,
        disabled: req.body.disabled,
        email: req.body.email,
        emailVerified: false,
      });

      const original_payload = { ...req.body };
      delete original_payload.email;
      delete original_payload.first_name;
      delete original_payload.last_name;
      delete original_payload.disabled;

      const employee_payload = {
        ...original_payload,
        created_at: new Date().toUTCString(),
        updated_at: new Date().toUTCString(),
        uid: user.uid,
      };

      const employee = await admin.firestore().collection("employees");
      const new_employee = await employee.add(employee_payload);

      console.log("created employee: ", new_employee.id);

      res.status(201).send({
        id: new_employee.id,
        ...employee_payload,
        password: newPassword,
      });
    } else {
      new ApiError(httpStatus[400], httpStatus["validation error"]);
    }
  } catch (error) {
    console.log(error);
    new ApiError(400, error);
  }
});

const getSingleEmployee = catchAsync(async (req, res) => {
  try {
    let id = req.params?.id;
    let employee = await db.collection("employees").doc(id).get().data();
    res.status(200).send(employee);
  } catch (error) {
    res.status(400).send({ message: "bad request" });
  }
});

const getAllEmployee = catchAsync(async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("employees").get();
    let collection = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    res.status(200).send(collection);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

module.exports = {
  createEmployee,
  getAllEmployee,
  getSingleEmployee,
};
