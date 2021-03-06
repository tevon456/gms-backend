const catchAsync = require("../utils/catchAsync");
const { admin, db } = require("../services/firebase");
const { auth } = require("firebase-admin");
const Fuse = require("fuse.js");

const searchReservation = catchAsync(async (req, res) => {
  try {
    const search = req.params?.search;
    const snapshot = await admin.firestore().collection("reservations").get();
    let collection = await Promise.all(
      snapshot.docs.map(async (doc) => {
        let vehicle = await db
          .collection("vehicles")
          .doc(doc.data()?.vehicle_id)
          .get();
        let customer = await db
          .collection("customers")
          .doc(doc.data()?.customer_id)
          .get();
        let employee = await admin
          .firestore()
          .collection("employees")
          .where("uid", "==", doc.data()?.employee_id)
          .get();
        let [employee_result] = employee.docs;

        let payload = {
          id: doc.id,
          ...doc.data(),
          vehicle: { ...vehicle.data() },
          customer: { ...customer.data() },
          employee: { ...employee_result.data(), id: employee_result.id },
        };
        return payload;
      })
    );
    const options = {
      keys: [
        "employee.first_name",
        "employee.last_name",
        "employee.email",
        "customer.first_name",
        "customer.last_name",
        "customer.email",
        "amount_deposited",
        "status",
        "payment_method",
        "created_at",
        "updated_at",
        "vehicle.manufacturer",
        "vehicle.model",
        "vehicle.price",
        "vehicle.color",
        "vehicle.year",
        "vehicle.body_type",
      ],
    };
    const index = Fuse.createIndex(options.keys, collection);
    const fuse = new Fuse(collection, options, index);

    let response = fuse.search(search);

    if (response) {
      let results = response.map((result) => {
        return result?.item;
      });
      res.status(200).send(results);
    } else {
      res.status(200).send([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

const searchVehicle = catchAsync(async (req, res) => {
  try {
    const search = req.params?.search;
    const vehicle_collection = await admin
      .firestore()
      .collection("vehicles")
      .get();
    let collection = await Promise.all(
      vehicle_collection.docs.map(async (doc) => {
        let payload = {
          id: doc.id,
          ...doc.data(),
        };
        return payload;
      })
    );

    const options = {
      keys: [
        "manufacturer",
        "model",
        "price",
        "color",
        "year",
        "body_type",
        "chassis_number",
      ],
    };
    const index = Fuse.createIndex(options.keys, collection);
    const fuse = new Fuse(collection, options, index);

    let response = fuse.search(search);

    if (response) {
      let results = response.map((result) => {
        return result?.item;
      });
      res.status(200).send(results);
    } else {
      res.status(200).send([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

const searchCustomer = catchAsync(async (req, res) => {
  try {
    const search = req.params?.search;
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

    const options = {
      keys: [
        "first_name",
        "last_name",
        "email",
        "dob",
        "year",
        "phone_number",
        "trn",
        "province",
        "gender",
        "country",
        "address_line_1",
        "address_line_2",
      ],
    };
    const index = Fuse.createIndex(options.keys, collection);
    const fuse = new Fuse(collection, options, index);

    let response = fuse.search(search);

    if (response) {
      let results = response.map((result) => {
        return result?.item;
      });
      res.status(200).send(results);
    } else {
      res.status(200).send([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

const searchEmployee = catchAsync(async (req, res) => {
  try {
    const search = req.params?.search;
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
    const options = {
      keys: ["displayName", "email", "phone_number", "role", "trn", "gender"],
    };
    const index = Fuse.createIndex(options.keys, collection);
    const fuse = new Fuse(collection, options, index);

    let response = fuse.search(search);

    if (response) {
      let results = response.map((result) => {
        return result?.item;
      });
      res.status(200).send(results);
    } else {
      res.status(200).send([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

module.exports = {
  searchReservation,
  searchVehicle,
  searchCustomer,
  searchEmployee,
};
