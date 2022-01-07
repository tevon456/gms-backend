const catchAsync = require("../utils/catchAsync");
const { admin, db } = require("../services/firebase");
const { auth } = require("firebase-admin");
const yup = require("yup");

const createReservation = catchAsync(async (req, res) => {
  try {
    let schema = yup.object().shape({
      customer_id: yup.string().required(),
      vehicle_id: yup.string().required(),
      employee_id: yup.string().required(),
      amount_deposited: yup
        .number()
        .min(0, "Set a higher value")
        .moreThan(0)
        .required(),
      balance_remaining: yup.number().required(),
      payment_method: yup.string().required(),
      additional_notes: yup.string(),
      status: yup
        .string()
        .required()
        .equals(["ongoing", "cancelled", "refunded", "complete"]),
    });

    //validate request body
    const isValid = await schema.isValid(req.body);

    if (isValid) {
      let id = req.body?.vehicle_id;
      let vehicle = db.collection("vehicles").doc(id);

      // create object with reservation document data
      const reservation_payload = {
        ...req.body,
        created_at: new Date().toUTCString(),
        updated_at: new Date().toUTCString(),
      };

      // create a new reservation from object above
      const reservation_collection = admin
        .firestore()
        .collection("reservations");
      const new_reservation = await reservation_collection.add(
        reservation_payload
      );

      // update reserved vehicle
      vehicle.update({
        ...(await vehicle.get()).data(),
        reserved: true,
        updated_at: new Date().toUTCString(),
      });

      // return new reservation
      res.status(201).send({
        ...(await new_reservation.get()).data,
        id: (await new_reservation.get()).id,
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

const getSingleReservation = catchAsync(async (req, res) => {
  try {
    // get reservation id from request param
    let id = req.params?.id;

    // get reservation from db and linked user
    let reservation = await db.collection("reservations").doc(id).get();

    // send the reservation to client
    res.status(200).send({
      ...reservation.data(),
      id: reservation.id,
    });
  } catch (error) {
    res.status(400).send({ message: "bad request" });
  }
});

const getCustomerReservation = catchAsync(async (req, res) => {
  try {
    // get reservation id from request param
    let id = req.params?.id;

    // get reservation from db and linked user
    let reservation = await db
      .collection("reservations")
      .where("customer_id", "==", id)
      .get();

    let collection = await Promise.all(
      reservation.docs.map(async (doc) => {
        let payload = {
          id: doc.id,
          ...doc.data(),
        };
        return payload;
      })
    );

    // send the reservation to client
    res.status(200).send(collection);
  } catch (error) {
    res.status(400).send({ message: "bad request" });
  }
});

const getEmployeeReservation = catchAsync(async (req, res) => {
  try {
    // get reservation id from request param
    let id = req.params?.id;

    // get reservation from db and linked user
    let reservation = await db
      .collection("reservations")
      .where("employee_id", "==", id)
      .get();

    let collection = await Promise.all(
      reservation.docs.map(async (doc) => {
        let payload = {
          id: doc.id,
          ...doc.data(),
        };
        return payload;
      })
    );

    // send the reservation to client
    res.status(200).send(collection);
  } catch (error) {
    res.status(400).send({ message: "bad request" });
  }
});

const getVehicleReservation = catchAsync(async (req, res) => {
  try {
    // get reservation id from request param
    let id = req.params?.id;

    // get reservation from db and linked user
    let reservation = await db
      .collection("reservations")
      .where("vehicle_id", "==", id)
      .get();

    let collection = await Promise.all(
      reservation.docs.map(async (doc) => {
        let payload = {
          id: doc.id,
          ...doc.data(),
        };
        return payload;
      })
    );

    // send the reservation to client
    res.status(200).send(collection);
  } catch (error) {
    res.status(400).send({ message: "bad request" });
  }
});

const getAllReservation = catchAsync(async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("reservations").get();
    let collection = await Promise.all(
      snapshot.docs.map(async (doc) => {
        let payload = {
          id: doc.id,
          ...doc.data(),
        };
        return payload;
      })
    );
    // if (collection.length === 0) {
    //   res.status(404).send({ message: "No reservations found" });
    // }
    res.status(200).send(collection);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

const updateReservation = catchAsync(async (req, res) => {
  try {
    // validate data
    let schema = yup.object().shape({
      customer_id: yup.string().required(),
      employee_id: yup.string().required(),
      amount_deposited: yup
        .number()
        .min(0, "Set a higher value")
        .moreThan(0)
        .required(),
      balance_remaining: yup.number().required(),
      payment_method: yup.string().required(),
      additional_notes: yup.string(),
      status: yup
        .string()
        .required()
        .equals(["ongoing", "cancelled", "refunded", "complete"]),
    });

    const isValid = await schema.isValid(req.body);

    if (isValid) {
      // get reservation from db
      let id = req.params?.id;
      let reservation = db.collection("reservations").doc(id);
      let vehicle = db
        .collection("vehicles")
        .doc((await reservation.get()).data?.vehicle_id);

      let payload = { ...req.body };
      delete payload.vehicle_id;

      await reservation.update({
        ...req.body,
        vehicle_id: (await reservation.get()).data?.vehicle_id,
        updated_at: new Date().toUTCString(),
      });

      if (req.body.status === "cancelled") {
        vehicle.update({
          ...(await vehicle.get()).data,
          reserved: false,
        });
      }

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

const deleteReservation = catchAsync(async (req, res) => {
  try {
    let id = req.params?.id;
    let reservation = db.collection("reservations").doc(id);
    let vehicle = db
      .collection("vehicles")
      .doc((await reservation.get()).data?.vehicle_id);

    vehicle.update({
      ...(await vehicle.get()).data,
      reserved: false,
    });

    await reservation.delete();

    res.status(200).send({ message: "deleted" });
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

module.exports = {
  createReservation,
  getAllReservation,
  getSingleReservation,
  updateReservation,
  deleteReservation,
  getCustomerReservation,
  getEmployeeReservation,
  getVehicleReservation,
};
