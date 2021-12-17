const catchAsync = require("../utils/catchAsync");
const { admin, db, storage } = require("../services/firebase");
const { auth } = require("firebase-admin");
const { getStorage, ref, uploadBytes } = require("firebase/storage");
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

    //validate request body
    const isValid = await schema.isValid(req.body);

    if (isValid) {
      //generate a random password
      const newPassword = randomstring.generate({
        length: 9,
        charset: "alphanumeric",
      });

      // create a firebase user with data from request
      const user = await auth().createUser({
        displayName: `${req.body.first_name} ${req.body.last_name}`,
        password: newPassword,
        disabled: req.body.disabled,
        email: req.body.email,
        emailVerified: false,
      });

      // copy and modify request body
      const original_payload = { ...req.body };
      delete original_payload.email;
      delete original_payload.first_name;
      delete original_payload.last_name;
      delete original_payload.disabled;

      // create object with employee document data
      const employee_payload = {
        ...original_payload,
        created_at: new Date().toUTCString(),
        updated_at: new Date().toUTCString(),
        uid: user.uid, // for linking back to the firebase user account used for auth
      };

      // create a new employee from object above
      const employee_collection = await admin
        .firestore()
        .collection("employees");
      const new_employee = await employee_collection.add(employee_payload);

      // return new employee and data from created firebase user
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
    // get employee id from request param
    let id = req.params?.id;

    // get employee from db and linked user
    let employee = await db.collection("employees").doc(id).get();

    let employee_uid = employee.data()?.uid;
    let employee_user = await auth().getUser(employee_uid);

    // send the employee to client
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
    if (collection.length === 0) {
      res.status(404).send({ message: "No employees found" });
    }
    res.status(200).send(collection);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

const updateEmployee = catchAsync(async (req, res) => {
  try {
    // validate data
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
      // get employee from db
      let id = req.params?.id;
      let employee = db.collection("employees").doc(id);

      // update employee and user
      let employee_uid = (await employee.get()).data()?.uid;
      await admin.auth().updateUser(employee_uid, {
        displayName: `${req.body.first_name} ${req.body.last_name}`,
        disabled: req.body.disabled,
        email: req.body.email,
      });

      await employee.update({
        trn: req.body.trn,
        gender: req.body.gender,
        role: req.body.role,
        phone_number: req.body.phone_number,
        updated_at: new Date().toUTCString(),
      });
      res.status(200).send({ message: "updated" });
    } else {
      schema.validate(req.body).catch((e) => {
        res.status(400).send({ error: e.errors });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error });
  }
});

const deleteEmployee = catchAsync(async (req, res) => {
  try {
    let id = req.params?.id;
    let employee = db.collection("employees").doc(id);
    let employee_uid = (await employee.get()).data()?.uid;

    await admin.auth().deleteUser(employee_uid);
    await employee.delete();

    res.status(200).send({ message: "deleted" });
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

// CUSTOMERS

const createCustomer = catchAsync(async (req, res) => {
  try {
    let schema = yup.object().shape({
      first_name: yup.string().required(),
      last_name: yup.string().required(),
      email: yup.string().email().required(),
      dob: yup.date().required(),
      gender: yup.string().required(),
      occupation: yup.string().required(),
      address_line_1: yup.string().required(),
      address_line_2: yup.string(),
      town: yup.string().required(),
      province: yup.string().required(),
      country: yup.string().required(),
      identification_type: yup.string().required(),
      identification_number: yup.string().required(),
      trn: yup.string().required(),
      phone_number: yup.string().required(),
    });

    const valid_avatar_types = [
      "image/png",
      "image/jpeg",
      "image/sgv+xml",
      "image/gif",
    ];

    //validate request body
    const isValid = await schema.isValid(req.body);
    if (isValid) {
      //create a new employee from object above
      const customer_collection = admin.firestore().collection("customers");
      const new_customer = await customer_collection.add({
        ...req.body,
        created_at: new Date().toUTCString(),
        updated_at: new Date().toUTCString(),
      });
      let new_customer_data = (await new_customer.get()).data();
      let new_customer_avatar = null;

      if (req.files?.avatar) {
        let avatar_temp_path = req.files.avatar.tempFilePath;
        let bucket = admin.storage().bucket();
        let [customer_avatar] = await bucket.upload(avatar_temp_path, {
          destination: `avatars/${new_customer.id}`,
          public: true,
          metadata: {
            contentType: req.files.avatar.mimetype,
          },
        });
        [new_customer_avatar] = await customer_avatar.getMetadata();
      }

      await new_customer.update({
        ...new_customer_data,
        avatar: new_customer_avatar.mediaLink,
        created_at: new Date().toUTCString(),
        updated_at: new Date().toUTCString(),
      });

      res.status(200).send({
        id: new_customer.id,
        ...new_customer_data,
        avatar: new_customer_avatar.mediaLink,
        created_at: new Date().toUTCString(),
        updated_at: new Date().toUTCString(),
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

const getAllCustomer = catchAsync(async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("customers").get();
    let collection = await Promise.all(
      snapshot.docs.map(async (doc) => {
        let payload = {
          id: doc.id,
          ...doc.data(),
        };
        return payload;
      })
    );
    if (collection.length === 0) {
      res.status(404).send({ message: "No customers found" });
    }
    res.status(200).send(collection);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

const getSingleCustomer = catchAsync(async (req, res) => {
  try {
    // get customer id from request param
    let id = req.params?.id;

    // get customer from db and linked user
    let customer = await db.collection("customers").doc(id).get();
    // send the customer to client
    res.status(200).send({
      ...customer.data(),
      id: customer.id,
    });
  } catch (error) {
    res.status(400).send({ message: "bad request" });
  }
});

const deleteCustomer = catchAsync(async (req, res) => {
  try {
    let id = req.params?.id;
    let customer = db.collection("customers").doc(id);
    await admin.storage().bucket().file(`avatars\${customer.id}`).delete();
    await customer.delete();

    res.status(200).send({ message: "deleted" });
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

module.exports = {
  createEmployee,
  getAllEmployee,
  getSingleEmployee,
  updateEmployee,
  deleteEmployee,
  createCustomer,
  getAllCustomer,
  getSingleCustomer,
  deleteCustomer,
};
