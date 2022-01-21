const catchAsync = require("../utils/catchAsync");
const { admin } = require("../services/firebase");
const yup = require("yup");

const createLog = catchAsync(async (req, res) => {
  try {
    let schema = yup.object().shape({
      employee_id: yup.string().required(),
      action_type: yup
        .string()
        .required()
        .equals(["create", "update", "delete"]),
      description: yup.string().required(),
    });

    //validate request body
    const isValid = await schema.isValid(req.body);

    if (isValid) {
      // create a new log from object above
      const log_collection = admin.firestore().collection("logs");
      const employee = await admin
        .firestore()
        .collection("employees")
        .where("uid", "==", req.body.employee_id)
        .get();
      console.log(employee);
      let [employee_result] = employee.docs[0];

      console.log(employee_result);
      const new_log = await log_collection.add({
        ...req.body,
        employee: {
          displayName: employee_result.data()?.displayName,
          email: employee_result.data()?.email,
          id: employee_result.id,
        },
        created_at: new Date().toUTCString(),
      });

      // return new log
      res.status(201).send({
        ...(await new_log.get()).data,
        id: (await new_log.get()).id,
      });
    } else {
      schema.validate(req.body).catch((e) => {
        res.status(400).send({ error: e.errors });
      });
    }
  } catch (error) {
    console.log("LOG ERROR: ", error);
    res.status(400).send({ error });
  }
});

const getAllLogs = catchAsync(async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("logs").get();

    let collection = await Promise.all(
      snapshot.docs.map(async (doc) => {
        let payload = {
          id: doc.id,
          ...doc.data(),
        };
        return payload;
      })
    );
    console.log(collection);
    res.status(200).send(collection);
  } catch (error) {
    console.log("LOG ERROR: ", error);
    res.status(500).send({ message: error });
  }
});

module.exports = {
  createLog,
  getAllLogs,
};
