const catchAsync = require("../utils/catchAsync");
const { admin } = require("../services/firebase");
const dateFNS = require("date-fns");

const createStatistics = async () => {
  try {
    const vehicles = await admin.firestore().collection("vehicles").get();
    const reservations = await admin
      .firestore()
      .collection("reservations")
      .get();
    const customers = await admin.firestore().collection("customers").get();
    const snapshot = admin.firestore().collection("statistics");

    let payload = {
      total_vehicles: vehicles.docs.length,
      total_reservations: reservations.docs.length,
      total_customers: customers.docs.length,
      last_updated: new Date().toUTCString(),
      next_update: dateFNS.addHours(new Date().toUTCString(), 4),
    };

    return await snapshot.add(payload);
  } catch (error) {
    throw error;
  }
};

const refreshStatistics = async (id) => {
  try {
    const vehicles = await admin.firestore().collection("vehicles").get();
    const reservations = await admin
      .firestore()
      .collection("reservations")
      .get();
    const customers = await admin.firestore().collection("customers").get();
    const snapshot = admin.firestore().collection("statistics").doc(id);

    let payload = {
      total_vehicles: vehicles.docs.length,
      total_reservations: reservations.docs.length,
      total_customers: customers.docs.length,
      last_updated: new Date().toUTCString(),
      next_update: dateFNS.addHours(new Date().toUTCString(), 4),
    };

    await snapshot.update(payload);
    return { payload };
  } catch (error) {
    throw error;
  }
};

const getStatistics = catchAsync(async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("statistics").get();

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
      // if none create stats
      const data = await createStatistics();
      res.status(200).send({
        ...(await data.get()).data,
      });
    } else if (
      // expired by 4 hours refresh stats
      dateFNS.isPast(dateFNS.addHours(collection[0]?.last_updated, 4))
    ) {
      res.status(200).send(await refreshStatistics(collection[0]?.id));
    } else {
      // return stored stats
      res.status(200).send(collection[0]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

module.exports = {
  getStatistics,
};
