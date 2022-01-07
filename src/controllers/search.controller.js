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

    const options = { keys: ["title", "author.firstName"] };

    const myIndex = Fuse.createIndex(options.keys, books);
    const fuse = new Fuse(books, options, myIndex);

    res.status(200).send(collection);
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
      keys: ["manufacturer", "model", "price", "color", "year", "body_type"],
    };
    const index = Fuse.createIndex(options.keys, collection);
    const fuse = new Fuse(collection, options, index);

    let response = fuse.search(search);

    if (response.length > 1) {
      let result = response.map((result) => {
        return result?.item;
      });
      res.status(200).send(result);
    } else {
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

module.exports = {
  searchReservation,
  searchVehicle,
};
