const catchAsync = require("../utils/catchAsync");
const { admin, db } = require("../services/firebase");
const { auth } = require("firebase-admin");
const yup = require("yup");

const createVehicle = catchAsync(async (req, res) => {
  try {
    let schema = yup.object().shape({
      manufacturer: yup.string().max(50, "Too Long!").required(),
      year: yup
        .number()
        .min(1900, "Year must be after 1900")
        .max(3000)
        .required(),
      vin: yup.string().required(),
      price: yup.number().required().min(0),
      used: yup.bool().required(),
      interior_color: yup.string(),
      model: yup.string().required(),
      fuel_type: yup.string().required(),
      alarm: yup.bool().required(),
      seats: yup.number().min(0, "Set a higher value").required(),
      color: yup.string().required(),
      gearbox: yup.string().required(),
      body_type: yup.string().min(3, "Too short").required(),
      drivetrain: yup.string().required(),
      engine_size: yup.string().required(),
      air_conditioning: yup.boolean().required(),
      air_bag: yup.bool().required(),
      hand_drive: yup.mixed().oneOf(["right", "left"]),
      power_windows: yup.bool().required(),
      chassis_number: yup.string(),
      engine_number: yup.string(),
      additional_notes: yup.string(),
    });

    //validate request body
    const isValid = await schema.isValid(req.body);

    if (isValid) {
      // user that initiated the request
      const user_token = req.headers?.authorization?.split(" ")[1];
      const user_decoded = await admin.auth().verifyIdToken(user_token);

      // create object with vehicle document data
      const vehicle_payload = {
        ...req.body,
        created_at: new Date().toUTCString(),
        updated_at: new Date().toUTCString(),
        images: [],
        created_by: {
          name: user_decoded?.name || "",
          email: user_decoded?.email || "",
          uid: user_decoded?.uid,
        },
      };

      // create a new vehicle from object above
      const vehicle_collection = admin.firestore().collection("vehicles");
      const vehicle = await vehicle_collection.add(vehicle_payload);

      // return new vehicle and data from created firebase user
      res.status(201).send({
        id: vehicle.id,
        ...(await vehicle.get()).data(),
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

const getSingleVehicle = catchAsync(async (req, res) => {
  try {
    // get vehicle id from request param
    let id = req.params?.id;

    // get vehicle from db and linked
    let vehicle = await db.collection("vehicles").doc(id).get();

    // send the vehicle to client
    res.status(200).send({
      ...vehicle.data(),
    });
  } catch (error) {
    res.status(400).send({ message: "bad request" });
  }
});

const getAllVehicle = catchAsync(async (req, res) => {
  try {
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
    if (collection.length === 0) {
      res.status(404).send({ message: "No vehicles found" });
    }
    res.status(200).send(collection);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

const addImages = catchAsync(async (req, res) => {
  try {
    // get vehicle id from request param
    let id = req.params?.id;

    // get vehicle from db and linked
    let vehicle = await db.collection("vehicles").doc(id).get();

    console.log(req.body.images[0]);

    // send the vehicle to client
    res.status(200).send({
      ...vehicle.data(),
    });
  } catch (error) {
    res.status(400).send({ message: "bad request" });
  }
});

module.exports = {
  createVehicle,
  getSingleVehicle,
  getAllVehicle,
  addImages,
};
