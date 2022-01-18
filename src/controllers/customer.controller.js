const catchAsync = require("../utils/catchAsync");
const { admin, db } = require("../services/firebase");
const yup = require("yup");

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
    let reservations = await db
      .collection("reservations")
      .where("customer_id", "==", id)
      .get();

    await Promise.all(
      reservations.docs.map(async (reservation) => {
        await reservation.delete();
      })
    );

    admin
      .storage()
      .bucket()
      .file(`avatars/${customer.id}`)
      .delete()
      .catch((e) => {
        console.log(e);
      });

    await customer.delete();

    res.status(200).send({ message: "deleted" });
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

const updateCustomer = catchAsync(async (req, res) => {
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

    //validate request body
    const isValid = await schema.isValid(req.body);
    if (isValid) {
      //create a new employee from object above
      let id = req.params?.id;
      let customer = db.collection("customers").doc(id);
      let customer_data = (await customer.get()).data();

      let customer_avatar = customer_data.avatar;

      if (req.files?.avatar) {
        let avatar_temp_path = req.files.avatar.tempFilePath;
        let bucket = admin.storage().bucket();

        //check for existing image
        let [has_avatar] = await admin
          .storage()
          .bucket()
          .file(`avatars/${customer.id}`)
          .exists();

        if (has_avatar) {
          await admin
            .storage()
            .bucket()
            .file(`avatars/${customer.id}`)
            .delete();
        }

        let [customer_avatar] = await bucket.upload(avatar_temp_path, {
          destination: `avatars/${customer.id}`,
          public: true,
          metadata: {
            contentType: req.files.avatar.mimetype,
          },
        });

        [customer_avatar] = await customer_avatar.getMetadata();

        let new_avatar = req.files?.avatar
          ? customer_avatar?.mediaLink || null
          : customer_data?.avatar || null;

        await customer.update({
          ...req.body,
          avatar: new_avatar,
          updated_at: new Date().toUTCString(),
        });

        res.status(200).send({
          id: customer.id,
          ...customer_data,
          avatar: new_avatar,
          updated_at: new Date().toUTCString(),
        });
      } else {
        let new_avatar = req.files?.avatar
          ? customer_avatar?.mediaLink || null
          : customer_data?.avatar || null;

        await customer.update({
          ...req.body,
          avatar: new_avatar,
          updated_at: new Date().toUTCString(),
        });

        res.status(200).send({
          id: customer.id,
          ...customer_data,
          avatar: new_avatar,
          updated_at: new Date().toUTCString(),
        });
      }
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

module.exports = {
  createCustomer,
  getAllCustomer,
  getSingleCustomer,
  deleteCustomer,
  updateCustomer,
};
