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

      res.status(201).send({
        id: new_employee.id,
        ...employee_payload,
        password: newPassword,
        displayName: user.displayName,
        email: user.email,
        disabled: user.disabled,
      });
    } else {
      schema.validate(req.body).catch((e) => {
        res.status(400).send({ error: e.errors });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

const getSingleEmployee = catchAsync(async (req, res) => {
  try {
    let id = req.params?.id;
    let employee = await db.collection("employees").doc(id).get();
    let employee_uid = employee.data()?.uid;
    let employee_user = await await auth().getUser(employee_uid);
    console.log(employee_user);
    res.status(200).send({
      ...employee.data(),
      email: employee_user.email,
      displayName: employee_user.displayName,
      disabled: employee_user.disabled,
    });
  } catch (error) {
    res.status(400).send({ message: "bad request" });
  }
});

const getAllEmployee = catchAsync(async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("employees").get();
    let collection = await Promise.all(
      snapshot.docs.map(async (doc) => {
        let employee_uid = doc.data()?.uid;
        let employee_user = await auth().getUser(employee_uid);
        let payload = {
          id: doc.id,
          ...doc.data(),
          email: employee_user.email,
          displayName: employee_user.displayName,
          disabled: employee_user.disabled,
        };
        return payload;
      })
    );
    res.status(200).send(collection);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

const updateEmployee = catchAsync(async (req, res) => {});

module.exports = {
  createEmployee,
  getAllEmployee,
  getSingleEmployee,
};
